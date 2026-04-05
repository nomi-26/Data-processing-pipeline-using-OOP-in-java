package backend.src.node;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FilterNode extends Node{
    private String field,operator;
    private Object value;

    public FilterNode(String field,String operator,Object value){
        this.field = field;
        this.operator = operator;
        this.value = value;
    }

    public List<Map<String, Object>> process(List<Map<String, Object>> data){
        List<Map<String, Object>> result = new ArrayList<>();

        for(Map<String, Object> row : data){
            if(matches(row)){
                result.add(row);
            }
        }
        return result;
    }

    
private boolean matches(Map<String, Object> row){
    Object val = row.get(field); 
    
    if(val instanceof Number){
        double num = ((Number) val).doubleValue();
        double target = ((Number) value).doubleValue();
        switch(operator){
            case ">" : return num > target;
            case "<" : return num < target;
            case ">=": return num >= target;
            case "<=": return num <= target;
            case "==": return num == target;
            default  : return false;
        }
    } else if(val instanceof String){
        String str = (String) val;
        String target = (String) value;
        switch(operator){
            case "=="       : return str.equals(target);
            case "contains" : return str.contains(target);
            case "startsWith": return str.startsWith(target);
            case "endsWith" : return str.endsWith(target);
            default         : return false;
        }
    }
    return false;
}
}
