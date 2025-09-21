package org.otbs.www.backend.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    String username;
    String password;
    String email;
    String phone;
    String role;
    String status;
    String created_at;
    String updated_at;
    String deleted_at;
    String last_login;
    String city;
    String zip_code;
}
