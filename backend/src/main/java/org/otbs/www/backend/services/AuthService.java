package org.otbs.www.backend.services;

import org.otbs.www.backend.repositories.AuthRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    AuthRepo authRepo;
}
