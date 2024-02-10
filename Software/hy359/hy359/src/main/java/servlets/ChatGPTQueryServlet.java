package servlets;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class ChatGPTQueryServlet extends HttpServlet {

    private static final String API_KEY = "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"; // Replace with your API key
    private static final String MODEL = "gpt-3.5-turbo";

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    String prompt = request.getParameter("question");
    String chatResponse = chatGPT(prompt);

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    try {
        JsonObject jsonResponse = new JsonObject();
        jsonResponse.addProperty("answer", chatResponse);
        response.getWriter().write(jsonResponse.toString());
    } catch (Exception e) {
        e.printStackTrace();
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error processing response");
    }
}

    private static String chatGPT(String prompt) {
        String url = "https://api.openai.com/v1/chat/completions";

        try {
            URL obj = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) obj.openConnection();
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Authorization", "Bearer " + API_KEY);
            connection.setRequestProperty("Content-Type", "application/json");

            JsonObject messageJson = new JsonObject();
            messageJson.addProperty("role", "user");
            messageJson.addProperty("content", prompt);

            JsonArray messagesArray = new JsonArray();
            messagesArray.add(messageJson);

            JsonObject bodyJson = new JsonObject();
            bodyJson.addProperty("model", MODEL);
            bodyJson.add("messages", messagesArray);

            connection.setDoOutput(true);
            try (OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream())) {
                writer.write(bodyJson.toString());
                writer.flush();
            }

            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(connection.getInputStream()))) {
                String line;
                while ((line = br.readLine()) != null) {
                    response.append(line);
                }
            }

            return extractMessageFromJSONResponse(response.toString());
        } catch (IOException e) {
            e.printStackTrace();
            return "Error: Could not connect to ChatGPT API - " + e.getMessage();
        }
    }

    private static String extractMessageFromJSONResponse(String response) {
    response = new String(response.getBytes(), StandardCharsets.UTF_8);

    try {
      JsonParser parser = new JsonParser();
      JsonObject jsonResponse = parser.parse(response).getAsJsonObject();
      JsonObject choice = jsonResponse.getAsJsonArray("choices").get(0).getAsJsonObject();
      JsonObject message = choice.getAsJsonObject("message");
      return message.get("content").getAsString();
    } catch (Exception e) {
      e.printStackTrace();
      return "Error parsing the response: " + e.getMessage() + " - Response: " + response;
    }
  }

}