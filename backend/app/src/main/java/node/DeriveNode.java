package main.java.node;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DeriveNode extends Node {
    private String field;
    private String operator;
    private Object value;
    private String newColumn;
    private Object trueVal;
    private Object falseVal;

    public DeriveNode(String field, String operator, Object value,
                      String newColumn, Object trueVal, Object falseVal) {
        this.field = field;
        this.operator = operator;
        this.value = value;
        this.newColumn = newColumn;
        this.trueVal = trueVal;
        this.falseVal = falseVal;
    }

    public List<Map<String, Object>> process(List<Map<String, Object>> data) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : data) {
            Map<String, Object> newRow = new HashMap<>(row);
            newRow.put(newColumn, matches(row) ? trueVal : falseVal);
            result.add(newRow);
        }
        return result;
    }

    private boolean matches(Map<String, Object> row) {
        Object val = row.get(field);

        if (val instanceof Number) {
            double num = ((Number) val).doubleValue();
            double target = ((Number) value).doubleValue();
            switch (operator) {
                case ">"  : return num > target;
                case "<"  : return num < target;
                case ">=" : return num >= target;
                case "<=" : return num <= target;
                case "==" : return num == target;
                default   : return false;
            }
        }

        if (val instanceof String) {
            String str = (String) val;
            String target = (String) value;
            switch (operator) {
                case "=="         : return str.equals(target);
                case "contains"   : return str.contains(target);
                case "startsWith" : return str.startsWith(target);
                case "endsWith"   : return str.endsWith(target);
                default           : return false;
            }
        }

        return false;
    }
}