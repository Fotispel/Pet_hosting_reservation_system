package servlets;

import database.tables.EditPetKeepersTable;
import mainClasses.PetKeeper;
import com.google.gson.Gson;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

public class GetKeeperInfo extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        int keeperId = Integer.parseInt(request.getParameter("keeperId"));
        try {
            EditPetKeepersTable editPetKeepersTable = new EditPetKeepersTable();
            PetKeeper keeper = editPetKeepersTable.getPetKeeperById(keeperId);

            String json = new Gson().toJson(keeper);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(json);
        } catch (Exception ex) {
            ex.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}