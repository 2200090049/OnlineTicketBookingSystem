package org.otbs.www.backend.repositories;

import org.otbs.www.backend.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRepo extends JpaRepository<Users, Integer> {
    Users findByUsername(String username);

    Optional<Object> findByEmail(String email);
}
