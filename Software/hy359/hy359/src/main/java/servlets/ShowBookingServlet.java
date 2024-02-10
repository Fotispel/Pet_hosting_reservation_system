package servlets;

import database.tables.EditBookingsTable;
import mainClasses.Booking;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ShowBookingServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {
            EditBookingsTable editBookingsTable = new EditBookingsTable();
            ArrayList<Booking> bookings = editBookingsTable.getAllBookings();

            Gson gson = new Gson();
            String json = gson.toJson(bookings);
            out.println(json);
        } catch (Exception ex) {
            ex.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Read JSON data from request
        StringBuilder sb = new StringBuilder();
        String s;
        while ((s = request.getReader().readLine()) != null) {
            sb.append(s);
        }
        String json = sb.toString();

        // Convert JSON to list of booking updates
        Type listType = new TypeToken<ArrayList<Map<String, String>>>() {}.getType();
        List<Map<String, String>> bookingUpdates = new Gson().fromJson(json, listType);

        // Update each booking
        try {
            EditBookingsTable editBookingsTable = new EditBookingsTable();
            for (Map<String, String> update : bookingUpdates) {
                int bookingId = Integer.parseInt(update.get("bookingId"));
                String status = update.get("status");
                editBookingsTable.updateBooking(bookingId, status);
            }
            // Send success response
            response.setContentType("application/json");
            PrintWriter out = response.getWriter();
            out.print("{\"success\": true}");
            out.flush();
        } catch (Exception e) {
            // Handle exceptions and send error response
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}