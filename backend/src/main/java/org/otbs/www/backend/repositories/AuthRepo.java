package org.otbs.www.backend.repositories;

import org.otbs.www.backend.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthRepo extends JpaRepository<Users, Integer> {
    Users findByEmail(String email);

    Users findByUsername(String username);

    Users findByPhone(String phone);
}
