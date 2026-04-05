package backend.src.server;

import backend.src.node.*;
import backend.src.pipeline.Pipeline;
import com.google.gson.*;
import com.sun.net.httpserver.HttpExchange;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class PipelineHandler extends CORSHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // add CORS headers to every response
        addCORSHeaders(exchange);

        // handle preflight OPTIONS request
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        // read request body
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        // parse JSON
        Gson gson = new Gson();
        JsonObject request = gson.fromJson(body, JsonObject.class);

        // get input data — list of rows
        JsonArray inputArray = request.getAsJsonArray("input");
        List<Map<String, Object>> inputData = new ArrayList<>();

        for (JsonElement element : inputArray) {
            JsonObject rowJson = element.getAsJsonObject();
            Map<String, Object> row = new HashMap<>();
            for (String key : rowJson.keySet()) {
                JsonElement val = rowJson.get(key);
                if (val.isJsonPrimitive()) {
                    JsonPrimitive prim = val.getAsJsonPrimitive();
                    if (prim.isNumber()) {
                        row.put(key, prim.getAsDouble());
                    } else {
                        row.put(key, prim.getAsString());
                    }
                }
            }
            inputData.add(row);
        }

        // build pipeline from nodes array
        Pipeline pipeline = new Pipeline();
        JsonArray nodes = request.getAsJsonArray("pipeline");

        for (JsonElement element : nodes) {
            JsonObject nodeJson = element.getAsJsonObject();
            String type = nodeJson.get("node").getAsString();

            switch (type) {
                case "filter":
                    String filterField = nodeJson.get("field").getAsString();
                    String filterOp    = nodeJson.get("op").getAsString();
                    Object filterVal   = parseValue(nodeJson.get("value"));
                    pipeline.addNode(new FilterNode(filterField, filterOp, filterVal));
                    break;

                case "transform":
                    String transformField = nodeJson.get("field").getAsString();
                    String transformOp    = nodeJson.get("op").getAsString();
                    Object transformVal   = parseValue(nodeJson.get("value"));
                    pipeline.addNode(new TransformNode(transformField, transformOp, transformVal));
                    break;

                case "aggregate":
                    String aggField = nodeJson.get("field").getAsString();
                    String aggOp    = nodeJson.get("op").getAsString();
                    pipeline.addNode(new AggregateNode(aggField, aggOp));
                    break;

                case "output":
                    pipeline.addNode(new OutputNode());
                    break;
            }
        }

        // execute pipeline
        List<List<Map<String, Object>>> steps = pipeline.execute(inputData);

        // build response
        List<Map<String, Object>> response = new ArrayList<>();
        JsonArray nodesForLabel = request.getAsJsonArray("pipeline");

        for (int i = 0; i < steps.size(); i++) {
            Map<String, Object> step = new HashMap<>();
            step.put("node", nodesForLabel.get(i).getAsJsonObject().get("node").getAsString());
            step.put("data", steps.get(i));
            step.put("count", steps.get(i).size());
            response.add(step);
        }

        // send response
        String jsonResponse = gson.toJson(response);
        byte[] responseBytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, responseBytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(responseBytes);
        os.close();
    }

    // helper — parse a JSON value into Double or String
    private Object parseValue(JsonElement element) {
        if (element == null) return null;
        JsonPrimitive prim = element.getAsJsonPrimitive();
        if (prim.isNumber()) return prim.getAsDouble();
        return prim.getAsString();
    }
}