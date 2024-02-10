/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import com.google.gson.Gson;
import mainClasses.PetOwner;
import database.DB_Connection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author Mike
 */
public class EditPetOwnersTable {

    public void addPetOwnerFromJSON(String json) throws ClassNotFoundException {
        PetOwner user = jsonToPetOwner(json);
        addNewPetOwner(user);
    }

    public PetOwner jsonToPetOwner(String json) {
        Gson gson = new Gson();

        PetOwner user = gson.fromJson(json, PetOwner.class);
        return user;
    }

    public String petOwnerToJSON(PetOwner user) {
        Gson gson = new Gson();

        String json = gson.toJson(user, PetOwner.class);
        return json;
    }

    public void updatePetOwner(String username, String password, String firstname, String lastname, String birthdate, String gender, String job, String country, String city, String address, String lat, String lon, String telephone, String personalpage) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        String update = "UPDATE petowners SET "
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
                + "personalpage='" + personalpage + "' "
                + "WHERE username = '" + username + "'";
        stmt.executeUpdate(update);
    }

    public void updatePetOwner(String username, String personalpage) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String update = "UPDATE petowners SET personalpage='" + personalpage + "' WHERE username = '" + username + "'";
        stmt.executeUpdate(update);
    }

    public PetOwner databaseToPetOwners(String username, String password) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM petowners WHERE username = '" + username + "' AND password='" + password + "'");
            rs.next();
            String json = DB_Connection.getResultsToJSON(rs);
            Gson gson = new Gson();
            PetOwner user = gson.fromJson(json, PetOwner.class);
            return user;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public String databasePetOwnerToJSON(String username, String password) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT * FROM petowners WHERE username = '" + username + "' AND password='" + password + "'");
            rs.next();
            String json = DB_Connection.getResultsToJSON(rs);
            return json;
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
        return null;
    }

    public void createPetOwnersTable() throws SQLException, ClassNotFoundException {

        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        String query = "CREATE TABLE petowners "
                + "(owner_id INTEGER not NULL AUTO_INCREMENT, "
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
                + " PRIMARY KEY (owner_id))";
        stmt.execute(query);
        stmt.close();
    }

    /**
     * Establish a database connection and add in the database.
     *
     * @throws ClassNotFoundException
     */
    public void addNewPetOwner(PetOwner user) throws ClassNotFoundException {
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
                        + " petowners (username,email,password,firstname,lastname,birthdate,gender,country,city,address,personalpage,"
                        + "job,telephone,lat,lon)"
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
                        + "'" + user.getLon() + "'"
                        + ")";
                //stmt.execute(table);
                System.out.println(insertQuery);
                stmt.executeUpdate(insertQuery);
                System.out.println("The pet owner was successfully added in the database.");

                /* Get the member id from the database and set it to the member */
                stmt.close();
            }

        } catch (SQLException ex) {
            Logger.getLogger(EditPetOwnersTable.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public ArrayList<PetOwner> getAllPetOwners() throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        ArrayList<PetOwner> owners = new ArrayList<>();

        try {
            ResultSet rs = stmt.executeQuery("SELECT * FROM petowners");

            while (rs.next()) {
                String json = DB_Connection.getResultsToJSON(rs);
                Gson gson = new Gson();
                PetOwner owner = gson.fromJson(json, PetOwner.class);
                owners.add(owner);
            }

            return owners;
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

    public boolean deletePetOwnerByOwnerId(String OwnerIdToDelete) throws SQLException, ClassNotFoundException {
        Connection con = null;
        PreparedStatement stmt = null;

        try {
            con = DB_Connection.getConnection();
            String delete_from_reviews = "DELETE FROM reviews WHERE owner_id = ?";
            String delete_from_messages = "DELETE FROM messages WHERE booking_id IN (SELECT booking_id FROM bookings WHERE owner_id = ?)";
            String delete_from_bookings = "DELETE FROM bookings WHERE owner_id = ?";
            String delete_from_pets = "DELETE FROM pets WHERE owner_id = ?";
            String delete_from_petowners = "DELETE FROM petowners WHERE owner_id = ?";

            stmt = con.prepareStatement(delete_from_reviews);
            stmt.setString(1, OwnerIdToDelete);
            stmt.executeUpdate();

            stmt = con.prepareStatement(delete_from_messages);
            stmt.setString(1, OwnerIdToDelete);
            stmt.executeUpdate();

            stmt = con.prepareStatement(delete_from_bookings);
            stmt.setString(1, OwnerIdToDelete);
            stmt.executeUpdate();

            stmt = con.prepareStatement(delete_from_pets);
            stmt.setString(1, OwnerIdToDelete);
            stmt.executeUpdate();

            stmt = con.prepareStatement(delete_from_petowners);
            stmt.setString(1, OwnerIdToDelete);
            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected > 0) {
                System.out.println("\nPetOwner with username " + OwnerIdToDelete + " has been deleted.\n");
                return true;
            } else {
                System.out.println("\nPetOwner with username " + OwnerIdToDelete + " not found.\n");
                return false;
            }
        } catch (SQLIntegrityConstraintViolationException ex) {
            System.out.println("Cannot delete PetOwner due to foreign key constraint.");
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

    public int countOwners() throws SQLException, ClassNotFoundException {
        Connection con = null;
        PreparedStatement stmt = null;

        try {
            con = DB_Connection.getConnection();
            String countQuery = "SELECT COUNT(*) AS ownerCount FROM petowners";
            stmt = con.prepareStatement(countQuery);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                int ownerCount = rs.getInt("ownerCount");
                return ownerCount;
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

    public int getOwnerIdByUsername(String username) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        PreparedStatement stmt = null;

        try {
            String selectQuery = "SELECT owner_id FROM petowners WHERE username = ?";
            stmt = con.prepareStatement(selectQuery);
            stmt.setString(1, username);
            System.out.println("Username in servlet " + username);

            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt("owner_id");
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
        return -1;
    }

    public int find_ownerId_from_username(String username) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        int owner_id = -1;
        PreparedStatement stmt = null;
        try {
            String selectQuery = "SELECT owner_id FROM petowners WHERE username = ?";
            stmt = con.prepareStatement(selectQuery);
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                owner_id = rs.getInt("owner_id");
            }
            return owner_id;
        } catch (SQLException ex) {
            ex.printStackTrace();
            return owner_id;
        } finally {
            if (stmt != null) {
                stmt.close();
            }
            if (con != null) {
                con.close();
            }
        }
    }

    public double[] getLatLon(String owner_id) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        double[] lat_lon = new double[2];
        PreparedStatement stmt = null;
        try {
            String selectQuery = "SELECT lat, lon FROM petowners WHERE owner_id = ?";
            stmt = con.prepareStatement(selectQuery);
            stmt.setString(1, owner_id);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                lat_lon[0] = rs.getDouble("lat");
                lat_lon[1] = rs.getDouble("lon");
            }
            return lat_lon;
        } catch (SQLException ex) {
            ex.printStackTrace();
            return lat_lon;
        } finally {
            if (stmt != null) {
                stmt.close();
            }
            if (con != null) {
                con.close();
            }
        }
    }
}
