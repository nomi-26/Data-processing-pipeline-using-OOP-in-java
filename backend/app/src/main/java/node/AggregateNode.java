package main.java.node;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AggregateNode extends Node {
    private String field, operator;

    public AggregateNode(String field, String operator) {
        this.field = field;
        this.operator = operator;
    }

    public List<Map<String, Object>> process(List<Map<String, Object>> data) {
        List<Double> values = new ArrayList<>();
        for (Map<String, Object> row : data) {
            Object val = row.get(field);
            if (val instanceof Number) {
                values.add(((Number) val).doubleValue());
            }
        }

        double answer = compute(values);


        Map<String, Object> resultRow = new HashMap<>();
        resultRow.put("operation", operator);
        resultRow.put("field", field);
        resultRow.put("result", answer);

        List<Map<String, Object>> output = new ArrayList<>();
        output.add(resultRow);
        return output;
    }

    private double compute(List<Double> values) {
        switch (operator) {
            case "sum":
                double sum = 0;
                for (double v : values) sum += v;
                return sum;

            case "avg":
                double total = 0;
                for (double v : values) total += v;
                return total / values.size();

            case "max":
                return Collections.max(values);

            case "min":
                return Collections.min(values);

            case "count":
                return values.size();

            default:
                return 0;
        }
    }
}