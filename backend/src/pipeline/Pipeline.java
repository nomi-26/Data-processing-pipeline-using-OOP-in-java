package src.pipeline;

import src.node.Node;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Pipeline {
    private Node head;
    private Node tail;

    public void addNode(Node n) {
        if (head == null) {
            head = n;
            tail = n;
        } else {
            tail.setNext(n);
            tail = n;
        }
    }

    public List<List<Map<String, Object>>> execute(List<Map<String, Object>> data) {
        List<List<Map<String, Object>>> steps = new ArrayList<>();
        if (head != null) {
            head.run(data, steps);
        }
        return steps;
    }
}