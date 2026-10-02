package com.workflowhub.common.rsql;

import com.workflowhub.common.constant.RegexConstants;
import com.workflowhub.common.exception.BadRequestException;
import com.workflowhub.common.enums.ErrorCode;
import cz.jirutka.rsql.parser.ast.AndNode;
import cz.jirutka.rsql.parser.ast.ComparisonNode;
import cz.jirutka.rsql.parser.ast.OrNode;
import cz.jirutka.rsql.parser.ast.RSQLVisitor;
import jakarta.persistence.criteria.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
public class RsqlSearchVisitor<T> implements RSQLVisitor<Specification<T>, Void> {

    private static final Pattern SAFE_SELECTOR_PATTERN =
            Pattern.compile(RegexConstants.RSQL_SAFE_SELECTOR);

    // -----------------------------------------------------------------------
    // RSQLVisitor — logical nodes
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

    // -----------------------------------------------------------------------
    // RSQLVisitor — comparison node
    // -----------------------------------------------------------------------

    @Override
    public Specification<T> visit(ComparisonNode node, Void param) {
        String selector = node.getSelector();
        String operatorSymbol = node.getOperator().getSymbol();
        List<String> arguments = node.getArguments();

        validateSelector(selector);

        return (root, query, cb) -> {
            Path<?> path = resolvePath(root, selector);
            Class<?> javaType = path.getJavaType();

            return buildPredicate(cb, path, javaType, operatorSymbol, arguments);
        };
    }

    // -----------------------------------------------------------------------
    // Predicate building
    // -----------------------------------------------------------------------

    @SuppressWarnings({"unchecked", "rawtypes"})
    private Predicate buildPredicate(
            CriteriaBuilder cb,
            Path<?> path,
            Class<?> javaType,
            String operatorSymbol,
            List<String> arguments) {

        return switch (operatorSymbol) {
            case RsqlOperator.EQUAL_SYMBOL -> {
                Object value = convertValue(arguments.get(0), javaType);
                yield cb.equal(path, value);
            }
            case RsqlOperator.NOT_EQUAL_SYMBOL -> {
                Object value = convertValue(arguments.get(0), javaType);
                yield cb.notEqual(path, value);
            }
            case RsqlOperator.LESS_THAN_SYMBOL -> {
                Comparable value = (Comparable) convertValue(arguments.get(0), javaType);
                yield cb.lessThan((Expression<Comparable>) path, value);
            }
            case RsqlOperator.LESS_EQUAL_SYMBOL -> {
                Comparable value = (Comparable) convertValue(arguments.get(0), javaType);
                yield cb.lessThanOrEqualTo((Expression<Comparable>) path, value);
            }
            case RsqlOperator.GREATER_THAN_SYMBOL -> {
                Comparable value = (Comparable) convertValue(arguments.get(0), javaType);
                yield cb.greaterThan((Expression<Comparable>) path, value);
            }
            case RsqlOperator.GREATER_EQUAL_SYMBOL -> {
                Comparable value = (Comparable) convertValue(arguments.get(0), javaType);
                yield cb.greaterThanOrEqualTo((Expression<Comparable>) path, value);
            }
            case RsqlOperator.IN_SYMBOL -> {
                List<Object> values = arguments.stream()
                        .map(arg -> convertValue(arg, javaType))
                        .toList();
                yield path.in(values);
            }
            case RsqlOperator.NOT_IN_SYMBOL -> {
                List<Object> values = arguments.stream()
                        .map(arg -> convertValue(arg, javaType))
                        .toList();
                yield path.in(values).not();
            }
            case RsqlOperator.LIKE_SYMBOL -> {
                String pattern = "%" + arguments.get(0) + "%";
                yield cb.like(cb.lower((Expression<String>) path), pattern.toLowerCase());
            }
            default -> throw new BadRequestException(
                    "Unsupported RSQL operator: " + operatorSymbol);
        };
    }

    // -----------------------------------------------------------------------
    // Security: selector validation
    // -----------------------------------------------------------------------

    /**
     * Validates that the field selector only contains safe characters.
     * Rejects any selector that doesn't match the whitelist pattern.
     *
     * @param selector the RSQL field selector
     * @throws BadRequestException if the selector is invalid
     */
    private void validateSelector(String selector) {
        if (selector == null || !SAFE_SELECTOR_PATTERN.matcher(selector).matches()) {
            throw new BadRequestException(
                    "Invalid RSQL field selector: '%s'. Only alphanumeric names, dots (for nested paths), and underscores are allowed."
                            .formatted(selector));
        }
    }

    // -----------------------------------------------------------------------
    // Path resolution
    // -----------------------------------------------------------------------

    /**
     * Resolves a dot-separated field path on the JPA root.
     *
     * <p>Example: {@code "project.name"} navigates from root → project → name.</p>
     */
    private Path<?> resolvePath(Root<T> root, String selector) {
        try {
            String[] parts = selector.split("\\.");
            Path<?> path = root.get(parts[0]);
            for (int i = 1; i < parts.length; i++) {
                path = ((Path<?>) path).get(parts[i]);
            }
            return path;
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Unknown field '%s' in RSQL filter expression".formatted(selector));
        }
    }

    // -----------------------------------------------------------------------
    // Type conversion
    // -----------------------------------------------------------------------

    /**
     * Converts an RSQL string argument to the target Java type.
     *
     * <p>Invalid conversions (e.g., "abc" for an Integer field) produce a
     * {@code 400 BAD_REQUEST} — not a {@code 500 INTERNAL_SERVER_ERROR}.</p>
     *
     * @param value      the raw string argument from the RSQL expression
     * @param targetType the Java type of the entity field
     * @return the converted value
     */
    @SuppressWarnings({"unchecked", "rawtypes"})
    private Object convertValue(String value, Class<?> targetType) {
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
                if ("true".equalsIgnoreCase(value)) return Boolean.TRUE;
                if ("false".equalsIgnoreCase(value)) return Boolean.FALSE;
                throw new IllegalArgumentException("Not a boolean: " + value);
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
            // For unrecognised types, attempt String (may fail at predicate-building time)
            return value;

        } catch (IllegalArgumentException | DateTimeParseException e) {
            throw new BadRequestException(
                    "Cannot convert RSQL value '%s' to type '%s': %s"
                            .formatted(value, targetType.getSimpleName(), e.getMessage()),
                    e);
        }
    }
}
