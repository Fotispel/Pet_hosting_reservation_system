package servlets;

import database.tables.EditMessagesTable;
import mainClasses.Message;
import com.google.gson.Gson;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

public class SendMessagesServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        StringBuilder sb = new StringBuilder();
        String line;
        try (BufferedReader reader = request.getReader()) {
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        } catch (Exception e) {
            e.printStackTrace(); // Log the exception
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Error reading request data");
            return;
        }

        String json = sb.toString();
        System.out.println("Received JSON: " + json);

        try {
            Message message = new Gson().fromJson(json, Message.class);
            EditMessagesTable messagesTable = new EditMessagesTable();
            messagesTable.addMessageFromJSON(json);
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (Exception e) {
            e.printStackTrace(); // Log the exception
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to send message");
        }
    }
}
