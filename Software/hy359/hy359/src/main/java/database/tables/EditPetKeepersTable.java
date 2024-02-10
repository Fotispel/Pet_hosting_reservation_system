/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import com.google.gson.Gson;
import mainClasses.PetKeeper;
import database.DB_Connection;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.sql.PreparedStatement;
import java.sql.SQLIntegrityConstraintViolationException;

/**
 * @author Mike
 */
public class EditPetKeepersTable {

    public void addPetKeeperFromJSON(String json) throws ClassNotFoundException {
        PetKeeper user = jsonToPetKeeper(json);
        addNewPetKeeper(user);
    }

    public PetKeeper jsonToPetKeeper(String json) {
        Gson gson = new Gson();

        PetKeeper user = gson.fromJson(json, PetKeeper.class);
        return user;
    }

    public String petKeeperToJSON(PetKeeper user) {
        Gson gson = new Gson();

        String json = gson.toJson(user, PetKeeper.class);
        return json;
    }

    public void updatePetKeeper(String username, String password, String firstname, String lastname, String birthdate, String gender, String job, String country, String city, String address, String lat, String lon, String telephone, String personalpage, String property, String propertydescription, String catkeeper, String dogkeeper, String catprice, String dogprice) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        String update = "UPDATE petkeepers SET "
                + "password='" + password + "', "
                + "firstname='" + firstname + "', "
                + "lastname='" + lastname + "', "
                + "birthdate='" + birthdate + "', "
                + "gender='" + gender + "', "
                + "job='" + job + "', "
                + "country='" + country + "', "
                + "city='" + city + "', "
                + "address='" + address + "', "
                + "lat='" + lat + "', "
                + "lon='" + lon + "', "
                + "telephone='" + telephone + "', "
                + "personalpage='" + personalpage + "', "
                + "property='" + property + "', "
                + "propertydescription='" + propertydescription + "', "
                + "catkeeper='" + catkeeper + "', "
                + "dogkeeper='" + dogkeeper + "', "
                + "catprice='" + catprice + "', "
                + "dogprice='" + dogprice + "' "
                + "WHERE username = '" + username + "'";
        stmt.executeUpdate(update);
    }

    public void printPetKeeperDetails(String username, String password) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM petkeepers WHERE username = '" + username + "' AND password='" + password + "'");
            while (rs.next()) {
                System.out.println("===Result===");
                DB_Connection.printResults(rs);
            }

        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
    }

    public PetKeeper databaseToPetKeepers(String username, String password) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM petkeepers WHERE username = '" + username + "' AND password='" + password + "'");
            rs.next();
            String json = DB_Connection.getResultsToJSON(rs);
            Gson gson = new Gson();
            PetKeeper user = gson.fromJson(json, PetKeeper.class);
            return user;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public ArrayList<PetKeeper> getAvailableKeepers(String type) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<PetKeeper> keepers = new ArrayList<PetKeeper>();
        ResultSet rs = null;
        try {
            //if(type=="catkeeper")
            if ("all".equals(type)) {
                rs = stmt.executeQuery("SELECT * FROM `petKeepers` WHERE  `petKeepers`.`keeper_id` not in (select keeper_id "
                        + "from `bookings` where `status`='requested' or  `status`='accepted')\n" + "");
            } else if ("catKeepers".equals(type)) {
                rs = stmt.executeQuery("SELECT * FROM `petKeepers` WHERE `petKeepers`.`catkeeper`='true' AND `petKeepers`.`keeper_id` not in (select keeper_id "
                        + "from `bookings` where `status`='requested' or  `status`='accepted')");
            } else if ("dogKeepers".equals(type)) {
                rs = stmt.executeQuery("SELECT * FROM `petKeepers` WHERE `petKeepers`.`dogkeeper`='true' AND `petKeepers`.`keeper_id` not in (select keeper_id "
                        + "from `bookings` where `status`='requested' or  `status`='accepted')");
            }

            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                PetKeeper keeper = gson.fromJson(json, PetKeeper.class);
                keepers.add(keeper);
            }
            return keepers;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public ArrayList<PetKeeper> getKeepers(String type) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<PetKeeper> keepers = new ArrayList<PetKeeper>();
        ResultSet rs = null;
        try {
            if ("catkeeper".equals(type)) {
                rs = stmt.executeQuery("SELECT * FROM petkeepers WHERE catkeeper= '" + "true" + "'");
            } else if ("dogkeeper".equals(type)) {
                rs = stmt.executeQuery("SELECT * FROM petkeepers WHERE dogkeeper= '" + "true" + "'");
            }

            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                PetKeeper keeper = gson.fromJson(json, PetKeeper.class);
                keepers.add(keeper);
            }
            return keepers;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public String databasePetKeeperToJSON(String username, String password) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM petkeepers WHERE username = '" + username + "' AND password='" + password + "'");
            rs.next();
            String json = DB_Connection.getResultsToJSON(rs);
            return json;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public void createPetKeepersTable() throws SQLException, ClassNotFoundException {

        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        String query = "CREATE TABLE petkeepers "
                + "(keeper_id INTEGER not NULL AUTO_INCREMENT, "
                + "    username VARCHAR(30) not null unique,"
                + "    email VARCHAR(50) not null unique,	"
                + "    password VARCHAR(32) not null,"
                + "    firstname VARCHAR(30) not null,"
                + "    lastname VARCHAR(30) not null,"
                + "    birthdate DATE not null,"
                + "    gender  VARCHAR (7) not null,"
                + "    country VARCHAR(30) not null,"
                + "    city VARCHAR(50) not null,"
                + "    address VARCHAR(50) not null,"
                + "    personalpage VARCHAR(200) not null,"
                + "    job VARCHAR(200) not null,"
                + "    telephone VARCHAR(14),"
                + "    lat DOUBLE,"
                + "    lon DOUBLE,"
                + "    property VARCHAR(10) not null,"
                + "    propertydescription VARCHAR(200),"
                + "    catkeeper VARCHAR(10) not null,"
                + "    dogkeeper VARCHAR(10) not null,"
                + "    catprice INTEGER,"
                + "    dogprice INTEGER,"
                + " PRIMARY KEY (keeper_id))";
        stmt.execute(query);
        stmt.close();
    }

    /**
     * Establish a database connection and add in the database.
     *
     * @throws ClassNotFoundException
     */
    public void addNewPetKeeper(PetKeeper user) throws ClassNotFoundException {
        try {
            Connection con = DB_Connection.getConnection();

            // Check if the user already exists based on a unique identifier, like username or email
            PreparedStatement checkKeeper = con.prepareStatement("SELECT * FROM petkeepers WHERE username = ? OR email = ?");
            PreparedStatement checkowner = con.prepareStatement("SELECT * FROM petowners WHERE username = ? OR email = ?");
            checkKeeper.setString(1, user.getUsername());
            checkKeeper.setString(2, user.getEmail());
            checkowner.setString(1, user.getUsername());
            checkowner.setString(2, user.getEmail());
            ResultSet existingKeeper = checkKeeper.executeQuery();
            ResultSet existingowner = checkowner.executeQuery();

            if (existingKeeper.next() || existingowner.next()) {
                System.out.println("The user already exists in the database.");
            } else {

                Statement stmt = con.createStatement();

                String insertQuery = "INSERT INTO "
                        + " petkeepers (username,email,password,firstname,lastname,birthdate,gender,country,city,address,personalpage,"
                        + "job,telephone,lat,lon,property,propertydescription,catkeeper,dogkeeper,catprice,dogprice)"
                        + " VALUES ("
                        + "'" + user.getUsername() + "',"
                        + "'" + user.getEmail() + "',"
                        + "'" + user.getPassword() + "',"
                        + "'" + user.getFirstname() + "',"
                        + "'" + user.getLastname() + "',"
                        + "'" + user.getBirthdate() + "',"
                        + "'" + user.getGender() + "',"
                        + "'" + user.getCountry() + "',"
                        + "'" + user.getCity() + "',"
                        + "'" + user.getAddress() + "',"
                        + "'" + user.getPersonalpage() + "',"
                        + "'" + user.getJob() + "',"
                        + "'" + user.getTelephone() + "',"
                        + "'" + user.getLat() + "',"
                        + "'" + user.getLon() + "',"
                        + "'" + user.getProperty() + "',"
                        + "'" + user.getPropertydescription() + "',"
                        + "'" + user.getCatkeeper() + "',"
                        + "'" + user.getDogkeeper() + "',"
                        + "'" + user.getCatprice() + "',"
                        + "'" + user.getDogprice() + "'"
                        + ")";
                //stmt.execute(table);
                System.out.println(insertQuery);
                stmt.executeUpdate(insertQuery);
                System.out.println("The pet keeper was successfully added in the database.");

                /* Get the member id from the database and set it to the member */
                stmt.close();
            }

        } catch (SQLException ex) {
            Logger.getLogger(EditPetKeepersTable.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public ArrayList<PetKeeper> getAllPetKeepers() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<PetKeeper> keepers = new ArrayList<>();

        try {
            ResultSet rs = stmt.executeQuery("SELECT * FROM petkeepers");

            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                PetKeeper keeper = gson.fromJson(json, PetKeeper.class);
                keepers.add(keeper);
            }

            return keepers;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        } finally {
            // Ensure resources are closed
            stmt.close();
            con.close();
        }

        return null;
    }

    public boolean deletePetKeeperByKeeperId(String keeper_id_delete) throws SQLException, ClassNotFoundException {
        Connection con = null;
        PreparedStatement stmt = null;

        try {
            con = DB_Connection.getConnection();
            String delete_from_reviews = "DELETE FROM reviews WHERE keeper_id = ?";
            String delete_from_messages = "DELETE FROM messages WHERE booking_id IN (SELECT booking_id FROM bookings WHERE keeper_id = ?)";
            String delete_from_bookings = "DELETE FROM bookings WHERE keeper_id = ?";
            String delete_from_petkeepers = "DELETE FROM petkeepers WHERE keeper_id = ?";

            stmt = con.prepareStatement(delete_from_messages);
            stmt.setString(1, keeper_id_delete);
            stmt.executeUpdate();

            stmt = con.prepareStatement(delete_from_bookings);
            stmt.setString(1, keeper_id_delete);
            stmt.executeUpdate();

            stmt = con.prepareStatement(delete_from_reviews);
            stmt.setString(1, keeper_id_delete);
            stmt.executeUpdate();

            stmt = con.prepareStatement(delete_from_petkeepers);
            stmt.setString(1, keeper_id_delete);
            int rowsAffected_petkeepers = stmt.executeUpdate();

            if (rowsAffected_petkeepers > 0) {
                System.out.println("\nPetKeeper with username " + keeper_id_delete + " has been deleted.\n");
                return true;
            } else {
                System.out.println("\nPetKeeper with username " + keeper_id_delete + " not found.\n");
                return false;
            }
        } catch (SQLIntegrityConstraintViolationException ex) {
            System.out.println("Cannot delete PetKeeper due to foreign key constraint.");
            return false;
        } catch (SQLException ex) {
            ex.printStackTrace();
            return false;
        } finally {
            if (stmt != null) {
                stmt.close();
            }
            if (con != null) {
                con.close();
            }
        }
    }

    public int countKeepers() throws SQLException, ClassNotFoundException {
        Connection con = null;
        PreparedStatement stmt = null;

        try {
            con = DB_Connection.getConnection();
            String countQuery = "SELECT COUNT(*) AS keeperCount FROM petkeepers";
            stmt = con.prepareStatement(countQuery);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                int keeperCount = rs.getInt("keeperCount");
                return keeperCount;
            }
        } catch (SQLException ex) {
            ex.printStackTrace();
        } finally {
            if (stmt != null) {
                stmt.close();
            }
            if (con != null) {
                con.close();
            }
        }
        return 0;
    }

    public PetKeeper getPetKeeperById(int keeperId) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            String query = "SELECT * FROM petkeepers WHERE keeper_id = ?";
            pstmt = con.prepareStatement(query);
            pstmt.setInt(1, keeperId);
            rs = pstmt.executeQuery();

            if (rs.next()) {
                // Assuming you have a method to convert ResultSet to JSON
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                return gson.fromJson(json, PetKeeper.class);
            } else {
                return null; // Keeper not found
            }
        } catch (SQLException ex) {
            // Handle exceptions
            throw ex;
        } finally {
            // Clean up database resources
            if (rs != null) {
                rs.close();
            }
            if (pstmt != null) {
                pstmt.close();
            }
            if (con != null) {
                con.close();
            }
        }
    }

    public ArrayList<PetKeeper> getFilteredKeepers(String petType) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        ArrayList<PetKeeper> keepers = new ArrayList<>();

        boolean ownerCat = false;
        boolean ownerDog = false;
        if (Objects.equals(petType.trim(), "cat")) {
            ownerCat = true;
            ownerDog = false;
        } else if (Objects.equals(petType.trim(), "dog")) {
            ownerCat = false;
            ownerDog = true;
        } else {
            System.out.println("Invalid pet type.");
        }

        try {
            String query;
            if (ownerCat) {
                query = "SELECT * FROM petkeepers WHERE catkeeper = 'true';";
            } else {
                query = "SELECT * FROM petkeepers WHERE dogkeeper = 'true';";
            }

            pstmt = con.prepareStatement(query);
            rs = pstmt.executeQuery();

            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                PetKeeper keeper = gson.fromJson(json, PetKeeper.class);
                keepers.add(keeper);
            }
            return keepers;
        } catch (SQLException ex) {
            throw ex;
        } finally {
            if (rs != null) {
                rs.close();
            }
            if (pstmt != null) {
                pstmt.close();
            }
            if (con != null) {
                con.close();
            }
        }
    }
}
