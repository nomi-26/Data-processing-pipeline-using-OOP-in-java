package main.java.node;

import java.util.List;
import java.util.Map;

public abstract class Node {
    
    private Node nextNode;

    public void setNext(Node n) {
        nextNode = n;
    }

    public Node getNext() {
        return nextNode;
    }

    public abstract List<Map<String, Object>> process(List<Map<String, Object>> data);

    public void run(List<Map<String, Object>> data, List<List<Map<String, Object>>> steps) {
        List<Map<String, Object>> result = process(data);
        steps.add(result);
        if (nextNode != null) {
            nextNode.run(result, steps);
        }
    }
}