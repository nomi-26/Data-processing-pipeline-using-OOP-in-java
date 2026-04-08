package main.java.node;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class TransformNode extends Node {
    private String field, operator;
    private Object value;

    public TransformNode(String field, String operator, Object value) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    public List<Map<String, Object>> process(List<Map<String, Object>> data) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : data) {
            Map<String, Object> newRow = new HashMap<>(row); // copy row
            Object val = newRow.get(field);
            newRow.put(field, transform(val));               // replace field with transformed value
            result.add(newRow);
        }
        return result;
    }

    private Object transform(Object val) {
        if (val instanceof Number) {
            double num = ((Number) val).doubleValue();
            double target = ((Number) value).doubleValue();
            switch (operator) {
                case "add"      : return num + target;
                case "subtract" : return num - target;
                case "multiply" : return num * target;
                case "divide"   : return num / target;
                case "remainder": return num % target;
                default         : return val;
            }
        }
        if (val instanceof String) {
            String str = (String) val;
            switch (operator) {
                case "upper"    : return str.toUpperCase();
                case "lower"    : return str.toLowerCase();
                case "concat"   : return str.concat((String) value);
                case "substring": return str.substring(((Number) value).intValue());
                default         : return val;
            }
        }
        return val;
    }
}