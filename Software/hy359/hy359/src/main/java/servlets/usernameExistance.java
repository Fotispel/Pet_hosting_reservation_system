/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package servlets;

import database.DB_Connection;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author pelan
 */
public class usernameExistance extends HttpServlet {

    static boolean username_available;

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {
            /* TODO output your page here. You may use following sample code. */
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Servlet usernameExistance</title>");
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>Servlet usernameExistance at " + request.getContextPath() + "</h1>");
            out.println("</body>");
            out.println("</html>");
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String username = request.getParameter("username");
            Connection con = null;
            PreparedStatement checkOwner = null;
            PreparedStatement checkKeeper = null;
            ResultSet existingOwner = null;
            ResultSet existingKeeper = null;

            try {
                con = DB_Connection.getConnection();

                checkOwner = con.prepareStatement("SELECT * FROM petowners WHERE username = ?");
                checkOwner.setString(1, username);
                existingOwner = checkOwner.executeQuery();

                checkKeeper = con.prepareStatement("SELECT * FROM petkeepers WHERE username = ?");
                checkKeeper.setString(1, username);
                existingKeeper = checkKeeper.executeQuery();

                boolean usernameExistsOwners = existingOwner.next();
                boolean usernameExistsKeepers = existingKeeper.next();

                if (usernameExistsKeepers || usernameExistsOwners) {
                    response.getWriter().write("Username is not available");
                    username_available = false;
                } else {
                    response.getWriter().write("Username is available");
                    username_available = true;
                }
            } finally {
                // Close resources in a finally block to ensure they are always closed
                if (existingOwner != null) {
                    existingOwner.close();
                }
                if (checkOwner != null) {
                    checkOwner.close();
                }
                if (existingKeeper != null) {
                    existingKeeper.close();
                }
                if (checkKeeper != null) {
                    checkKeeper.close();
                }
                if (con != null) {
                    con.close();
                }
            }
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
