package com.workflowhub.common.rsql;

import com.workflowhub.common.enums.ErrorCode;
import com.workflowhub.common.exception.BadRequestException;
import cz.jirutka.rsql.parser.RSQLParser;
import cz.jirutka.rsql.parser.RSQLParserException;
import cz.jirutka.rsql.parser.ast.*;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.criteria.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Fluent builder and AST visitor for converting RSQL filter expressions into JPA {@link Specification}.
 *
 * <p>Supports:
 * <ul>
 *   <li>Auto-scanning primitive/scalar entity fields (excluding relations)</li>
 *   <li>Excluding sensitive fields</li>
 *   <li>Direct field mapping and aliases via {@code .field()}</li>
 *   <li>Many-to-One dot-path traversal via {@code .field("parentName", "parent.name", String.class)}</li>
 *   <li>One-to-Many cross-entity filtering with subquery {@code EXISTS} via {@code .exists(...)}</li>
 *   <li>Wildcard string search with {@code *} on {@code ==} and {@code !=}</li>
 *   <li>Thread-safe reuse as a {@code static final} constant in Service classes</li>
 * </ul>
 *
 * @param <T> the root entity type
 */
@Slf4j
@Component
public class RsqlSpecificationBuilder<T> implements RSQLVisitor<Specification<T>, Void> {

    private final Class<T> entityClass;
    private final Map<String, FieldMapping> fieldMappings;
    private final Map<String, ExistsMapping> existsMappings;
    private final RSQLParser parser;

    /**
     * Default constructor for Spring bean injection (backward-compatibility).
     */
    public RsqlSpecificationBuilder() {
        this(null, Collections.emptyMap(), Collections.emptyMap());
    }

    private RsqlSpecificationBuilder(
            Class<T> entityClass,
            Map<String, FieldMapping> fieldMappings,
            Map<String, ExistsMapping> existsMappings) {
        this.entityClass = entityClass;
        this.fieldMappings = Map.copyOf(fieldMappings);
        this.existsMappings = Map.copyOf(existsMappings);

        Set<ComparisonOperator> operators = new HashSet<>(RSQLOperators.defaultOperators());
        operators.add(RsqlOperator.LIKE);
        this.parser = new RSQLParser(operators);
    }

    /**
     * Entry point to create a builder for an entity.
     * Automatically scans all scalar fields on the entity and its superclasses.
     *
     * @param entityClass    the target entity class
     * @param excludedFields field names to exclude from auto-scanning
     * @param <T>            the entity type
     * @return a fluent builder
     */
    public static <T> Builder<T> forEntity(Class<T> entityClass, String... excludedFields) {
        return new Builder<>(entityClass, excludedFields);
    }

    /**
     * Parses an RSQL search expression using this builder's configuration.
     *
     * @param search the RSQL query string
     * @return JPA Specification, or an unrestricted specification if null/blank
     */
    public Specification<T> parse(@Nullable String search) {
        if (search == null || search.isBlank()) {
            return Specification.where(null);
        }
        try {
            Node rootNode = parser.parse(search.trim());
            return rootNode.accept(this);
        } catch (RSQLParserException | IllegalArgumentException e) {
            log.warn("Invalid RSQL expression: '{}' - {}", search, e.getMessage());
            throw new BadRequestException(
                    ErrorCode.INVALID_RSQL,
                    "Invalid search query: " + e.getMessage(),
                    e
            );
        }
    }

    /**
     * Convenience backward-compatible method for parsing without pre-instantiated builder.
     */
    public static <E> Specification<E> parse(@Nullable String search, Class<E> entityClass) {
        return forEntity(entityClass).build().parse(search);
    }

    // -----------------------------------------------------------------------
    // RSQLVisitor Implementation
    // -----------------------------------------------------------------------

    @Override
    public Specification<T> visit(AndNode node, Void param) {
        return node.getChildren().stream()
                .map(child -> child.accept(this, param))
                .reduce(Specification::and)
                .orElse(Specification.where(null));
    }

    @Override
    public Specification<T> visit(OrNode node, Void param) {
        return node.getChildren().stream()
                .map(child -> child.accept(this, param))
                .reduce(Specification::or)
                .orElse(Specification.where(null));
    }

    @Override
    public Specification<T> visit(ComparisonNode node, Void param) {
        String selector = node.getSelector();
        ComparisonOperator operator = node.getOperator();
        List<String> arguments = node.getArguments();

        if (existsMappings.containsKey(selector)) {
            ExistsMapping mapping = existsMappings.get(selector);
            return (root, query, cb) -> buildExistsPredicate(root, query, cb, mapping, operator, arguments);
        }

        if (fieldMappings.containsKey(selector)) {
            FieldMapping mapping = fieldMappings.get(selector);
            return (root, query, cb) -> {
                Path<?> path = resolvePath(root, mapping.propertyPath());
                return buildComparisonPredicate(cb, path, mapping.javaType(), operator, arguments);
            };
        }

        throw new BadRequestException(
                ErrorCode.INVALID_RSQL,
                "Unknown or unsearchable field '%s' in RSQL query".formatted(selector)
        );
    }

    // -----------------------------------------------------------------------
    // Predicate Building
    // -----------------------------------------------------------------------

    private Predicate buildExistsPredicate(
            Root<T> root,
            CommonAbstractCriteria query,
            CriteriaBuilder cb,
            ExistsMapping mapping,
            ComparisonOperator operator,
            List<String> arguments) {

        Subquery<Integer> subquery = query.subquery(Integer.class);
        Root<?> childRoot = subquery.from(mapping.targetEntityClass());
        subquery.select(cb.literal(1));

        Path<?> childJoinPath = resolvePath(childRoot, mapping.targetJoinPath());
        Path<?> rootJoinPath = resolvePath(root, mapping.rootJoinPath());
        Predicate correlation = cb.equal(childJoinPath, rootJoinPath);

        Path<?> filterPath = resolvePath(childRoot, mapping.filterField());
        Predicate filterPredicate = buildComparisonPredicate(
                cb, filterPath, mapping.fieldType(), operator, arguments);

        subquery.where(cb.and(correlation, filterPredicate));
        return cb.exists(subquery);
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private Predicate buildComparisonPredicate(
            CriteriaBuilder cb,
            Path<?> path,
            Class<?> type,
            ComparisonOperator operator,
            List<String> arguments) {

        String symbol = operator.getSymbol();

        if (arguments == null || arguments.isEmpty()) {
            throw new BadRequestException(ErrorCode.INVALID_RSQL, "RSQL operator '" + symbol + "' requires at least one argument");
        }

        String firstArg = arguments.get(0);

        // EQUAL (==)
        if (symbol.equals(RsqlOperator.EQUAL_SYMBOL)) {
            if (type == String.class && firstArg.contains("*")) {
                String pattern = firstArg.replace('*', '%').toLowerCase();
                return cb.like(cb.lower((Expression<String>) path), pattern);
            }
            return cb.equal(path, convertValue(firstArg, type));
        }

        // NOT EQUAL (!=)
        if (symbol.equals(RsqlOperator.NOT_EQUAL_SYMBOL)) {
            if (type == String.class && firstArg.contains("*")) {
                String pattern = firstArg.replace('*', '%').toLowerCase();
                return cb.notLike(cb.lower((Expression<String>) path), pattern);
            }
            return cb.notEqual(path, convertValue(firstArg, type));
        }

        // GREATER THAN (> or =gt=)
        if (symbol.equals(RsqlOperator.GREATER_THAN_SYMBOL) || symbol.equals(">")) {
            Comparable val = (Comparable) convertValue(firstArg, type);
            return cb.greaterThan((Expression<Comparable>) path, val);
        }

        // GREATER EQUAL (>= or =ge=)
        if (symbol.equals(RsqlOperator.GREATER_EQUAL_SYMBOL) || symbol.equals(">=")) {
            Comparable val = (Comparable) convertValue(firstArg, type);
            return cb.greaterThanOrEqualTo((Expression<Comparable>) path, val);
        }

        // LESS THAN (< or =lt=)
        if (symbol.equals(RsqlOperator.LESS_THAN_SYMBOL) || symbol.equals("<")) {
            Comparable val = (Comparable) convertValue(firstArg, type);
            return cb.lessThan((Expression<Comparable>) path, val);
        }

        // LESS EQUAL (<= or =le=)
        if (symbol.equals(RsqlOperator.LESS_EQUAL_SYMBOL) || symbol.equals("<=")) {
            Comparable val = (Comparable) convertValue(firstArg, type);
            return cb.lessThanOrEqualTo((Expression<Comparable>) path, val);
        }

        // IN (=in=)
        if (symbol.equals(RsqlOperator.IN_SYMBOL)) {
            List<Object> values = arguments.stream()
                    .map(arg -> convertValue(arg, type))
                    .toList();
            return path.in(values);
        }

        // OUT (=out=)
        if (symbol.equals(RsqlOperator.NOT_IN_SYMBOL)) {
            List<Object> values = arguments.stream()
                    .map(arg -> convertValue(arg, type))
                    .toList();
            return path.in(values).not();
        }

        // LIKE (=like=)
        if (symbol.equals(RsqlOperator.LIKE_SYMBOL)) {
            String pattern = firstArg.contains("%") ? firstArg : "%" + firstArg + "%";
            return cb.like(cb.lower((Expression<String>) path), pattern.toLowerCase());
        }

        throw new BadRequestException(ErrorCode.INVALID_RSQL, "Unsupported RSQL operator: " + symbol);
    }

    private static Path<?> resolvePath(Path<?> root, String pathStr) {
        try {
            String[] parts = pathStr.split("\\.");
            Path<?> current = root;
            for (String part : parts) {
                current = current.get(part);
            }
            return current;
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(ErrorCode.INVALID_RSQL, "Cannot resolve path '%s': %s".formatted(pathStr, e.getMessage()));
        }
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private Object convertValue(String value, Class<?> targetType) {
        if (value == null || "null".equalsIgnoreCase(value)) {
            return null;
        }
        try {
            if (targetType == String.class) {
                return value;
            }
            if (targetType == UUID.class) {
                return UUID.fromString(value);
            }
            if (targetType == Integer.class || targetType == int.class) {
                return Integer.parseInt(value);
            }
            if (targetType == Long.class || targetType == long.class) {
                return Long.parseLong(value);
            }
            if (targetType == Double.class || targetType == double.class) {
                return Double.parseDouble(value);
            }
            if (targetType == BigDecimal.class) {
                return new BigDecimal(value);
            }
            if (targetType == Boolean.class || targetType == boolean.class) {
                if ("true".equalsIgnoreCase(value) || "1".equals(value)) return Boolean.TRUE;
                if ("false".equalsIgnoreCase(value) || "0".equals(value)) return Boolean.FALSE;
                throw new IllegalArgumentException("Not a boolean value: " + value);
            }
            if (targetType == LocalDate.class) {
                return LocalDate.parse(value);
            }
            if (targetType == LocalDateTime.class) {
                return LocalDateTime.parse(value);
            }
            if (targetType.isEnum()) {
                return Enum.valueOf((Class<Enum>) targetType, value.toUpperCase());
            }
            return value;
        } catch (IllegalArgumentException | DateTimeParseException e) {
            throw new BadRequestException(
                    ErrorCode.INVALID_RSQL,
                    "Cannot convert RSQL value '%s' to type '%s': %s".formatted(value, targetType.getSimpleName(), e.getMessage()),
                    e
            );
        }
    }

    // -----------------------------------------------------------------------
    // Builder Class
    // -----------------------------------------------------------------------

    public static class Builder<T> {
        private final Class<T> entityClass;
        private final Map<String, FieldMapping> fieldMappings = new HashMap<>();
        private final Map<String, ExistsMapping> existsMappings = new HashMap<>();

        private Builder(Class<T> entityClass, String... excludedFields) {
            this.entityClass = entityClass;
            autoScanFields(entityClass, Set.of(excludedFields));
        }

        private void autoScanFields(Class<T> clazz, Set<String> excluded) {
            Class<?> current = clazz;
            while (current != null && current != Object.class) {
                for (Field field : current.getDeclaredFields()) {
                    if (Modifier.isStatic(field.getModifiers()) || Modifier.isTransient(field.getModifiers())) {
                        continue;
                    }
                    String name = field.getName();
                    if (excluded.contains(name)) {
                        continue;
                    }
                    if (field.isAnnotationPresent(ManyToOne.class)
                            || field.isAnnotationPresent(OneToMany.class)
                            || field.isAnnotationPresent(ManyToMany.class)
                            || field.isAnnotationPresent(OneToOne.class)
                            || Collection.class.isAssignableFrom(field.getType())
                            || Map.class.isAssignableFrom(field.getType())) {
                        continue;
                    }
                    Class<?> type = field.getType();
                    if (isSupportedType(type)) {
                        fieldMappings.putIfAbsent(name, new FieldMapping(name, type));
                    }
                }
                current = current.getSuperclass();
            }
        }

        private static boolean isSupportedType(Class<?> type) {
            return type == String.class
                    || type == UUID.class
                    || type == Boolean.class || type == boolean.class
                    || type == LocalDate.class
                    || type == LocalDateTime.class
                    || type == Integer.class || type == int.class
                    || type == Long.class || type == long.class
                    || type == Double.class || type == double.class
                    || type == BigDecimal.class
                    || type.isEnum();
        }

        /**
         * Registers a field alias or dot-path traversal for Many-to-One.
         *
         * @param selector     the selector exposed to RSQL queries
         * @param propertyPath the property path on the root entity (e.g. "parent.code")
         * @param type         the Java type of the property
         */
        public Builder<T> field(String selector, String propertyPath, Class<?> type) {
            fieldMappings.put(selector, new FieldMapping(propertyPath, type));
            return this;
        }

        /**
         * Shorthand when selector equals property path.
         */
        public Builder<T> field(String selector, Class<?> type) {
            return field(selector, selector, type);
        }

        /**
         * Registers an EXISTS subquery for One-to-Many cross-entity filtering.
         *
         * @param selector         RSQL selector exposed to API clients
         * @param targetEntity     entity in the EXISTS subquery (FROM clause)
         * @param targetJoinPath   path in child that references parent's PK (e.g. "project.id")
         * @param rootJoinPath     path on root entity to correlate (usually "id")
         * @param filterField      field in child entity to compare with RSQL value
         * @param fieldType        Java type of that field
         */
        public Builder<T> exists(
                String selector,
                Class<?> targetEntity,
                String targetJoinPath,
                String rootJoinPath,
                String filterField,
                Class<?> fieldType) {
            existsMappings.put(selector, new ExistsMapping(targetEntity, targetJoinPath, rootJoinPath, filterField, fieldType));
            return this;
        }

        /**
         * Builds the immutable RsqlSpecificationBuilder instance.
         */
        public RsqlSpecificationBuilder<T> build() {
            return new RsqlSpecificationBuilder<>(entityClass, fieldMappings, existsMappings);
        }
    }

    public record FieldMapping(String propertyPath, Class<?> javaType) {}

    public record ExistsMapping(
            Class<?> targetEntityClass,
            String targetJoinPath,
            String rootJoinPath,
            String filterField,
            Class<?> fieldType
    ) {}
}
