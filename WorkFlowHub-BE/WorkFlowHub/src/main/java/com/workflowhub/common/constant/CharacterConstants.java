package com.workflowhub.common.constant;

/**
 * Commonly used single-character and delimiter string constants.
 *
 * <p>Avoids scattered magic string literals for frequently used characters
 * such as delimiters, punctuation, and whitespace.</p>
 */
public final class CharacterConstants {

    private CharacterConstants() {
        throw new UnsupportedOperationException("CharacterConstants is a utility class");
    }

    public static final String EMPTY          = "";
    public static final String SPACE          = " ";
    public static final String COMMA          = ",";
    public static final String DOT            = ".";
    public static final String COLON          = ":";
    public static final String SEMICOLON      = ";";
    public static final String SLASH          = "/";
    public static final String BACKSLASH      = "\\";
    public static final String UNDERSCORE     = "_";
    public static final String HYPHEN         = "-";
    public static final String EQUALS         = "=";
    public static final String QUESTION_MARK  = "?";
    public static final String AMPERSAND      = "&";
    public static final String AT             = "@";
    public static final String HASH           = "#";
    public static final String ASTERISK       = "*";
    public static final String PIPE           = "|";
    public static final String NEW_LINE       = "\n";
    public static final String TAB            = "\t";
}
