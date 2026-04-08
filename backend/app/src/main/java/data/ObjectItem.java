package main.java.data;

import java.util.Map;

public class ObjectItem extends DataItem {
    private Map<String, Object> fields;

    public ObjectItem(Map<String, Object> fields) {
        this.fields = fields;
    }

    public Object getValue() {
        return fields; 
    }

    public String getType() {
        return "object";
    }

    public Object getField(String key) {
        return fields.get(key);
    }

    public void setField(String key, Object value) {
        fields.put(key, value);
    }
}