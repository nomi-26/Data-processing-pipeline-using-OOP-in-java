import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import backend.src.server.*;

public class Main {
    public static void main(String[] args) throws IOException {
        // create server on port 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // attach handler — any request to /pipeline goes to PipelineHandler
        server.createContext("/pipeline", new PipelineHandler());
        
        // start server
        server.start();
        
        System.out.println("Server running on http://localhost:8080");
    }
}
