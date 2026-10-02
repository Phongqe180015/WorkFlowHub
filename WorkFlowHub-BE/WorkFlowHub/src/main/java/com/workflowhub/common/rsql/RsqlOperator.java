package com.workflowhub.common.rsql;

import cz.jirutka.rsql.parser.ast.ComparisonOperator;
import cz.jirutka.rsql.parser.ast.RSQLOperators;

/**
 * Defines all RSQL comparison operators supported by the WorkFlowHub API.
 *
 * <p>Standard operators come from {@link RSQLOperators}. The {@code =like=} operator
 * is custom and registered at parser creation time in
 * {@link RsqlSpecificationBuilder}.</p>
 *
 * <h3>Supported operators:</h3>
 * <pre>
 *   ==      equals
 *   !=      not equals
 *   =lt=    less than
 *   =le=    less than or equal
 *   =gt=    greater than
 *   =ge=    greater than or equal
 *   =in=    in list
 *   =out=   not in list
 *   =like=  SQL LIKE (% wildcard)
 * </pre>
 */
public final class RsqlOperator {

    private RsqlOperator() {}

    // Standard RSQL operators (from RSQLOperators)
    public static final ComparisonOperator EQUAL           = RSQLOperators.EQUAL;
    public static final ComparisonOperator NOT_EQUAL       = RSQLOperators.NOT_EQUAL;
    public static final ComparisonOperator LESS_THAN       = RSQLOperators.LESS_THAN;
    public static final ComparisonOperator LESS_EQUAL      = RSQLOperators.LESS_THAN_OR_EQUAL;
    public static final ComparisonOperator GREATER_THAN    = RSQLOperators.GREATER_THAN;
    public static final ComparisonOperator GREATER_EQUAL   = RSQLOperators.GREATER_THAN_OR_EQUAL;
    public static final ComparisonOperator IN              = RSQLOperators.IN;
    public static final ComparisonOperator NOT_IN          = RSQLOperators.NOT_IN;

    /** Custom {@code =like=} operator for SQL LIKE pattern matching. */
    public static final ComparisonOperator LIKE =
            new ComparisonOperator("=like=", false);

    /** Symbol string for switch-based matching. */
    public static final String EQUAL_SYMBOL         = "==";
    public static final String NOT_EQUAL_SYMBOL     = "!=";
    public static final String LESS_THAN_SYMBOL     = "=lt=";
    public static final String LESS_EQUAL_SYMBOL    = "=le=";
    public static final String GREATER_THAN_SYMBOL  = "=gt=";
    public static final String GREATER_EQUAL_SYMBOL = "=ge=";
    public static final String IN_SYMBOL            = "=in=";
    public static final String NOT_IN_SYMBOL        = "=out=";
    public static final String LIKE_SYMBOL          = "=like=";
}
