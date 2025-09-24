package org.otbs.www.backend.repositories;

import java.util.List;

import org.otbs.www.backend.models.Users;
import org.otbs.www.backend.models.Vendor_Type;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepo extends JpaRepository<Users, Integer> {

    // Find users with pagination and filtering
    @Query("SELECT u FROM Users u WHERE " +
            "(:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:status IS NULL OR u.status = :status) AND " +
            "u.isVendor = false")
    Page<Users> findUsersWithFilters(
            @Param("search") String search,
            @Param("status") String status,
            Pageable pageable);

    // Find vendors with pagination and filtering - Fixed to use Vendor_Type enum
    @Query("SELECT u FROM Users u WHERE " +
            "(:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:vendorType IS NULL OR u.vendorType = :vendorType) AND " +
            "u.isVendor = true")
    Page<Users> findVendorsWithFilters(
            @Param("search") String search,
            @Param("vendorType") Vendor_Type vendorType,
            Pageable pageable);

    // Count all active users
    @Query("SELECT COUNT(u) FROM Users u WHERE u.status = 'ACTIVE' AND u.isVendor = false")
    Long countActiveUsers();

    // Count all active vendors
    @Query("SELECT COUNT(u) FROM Users u WHERE u.status = 'ACTIVE' AND u.isVendor = true")
    Long countActiveVendors();

    // Count all users
    @Query("SELECT COUNT(u) FROM Users u WHERE u.isVendor = false")
    Long countAllUsers();

    // Count all vendors
    @Query("SELECT COUNT(u) FROM Users u WHERE u.isVendor = true")
    Long countAllVendors();

    // Find recent users (last 30 days) - Fixed to use created_at string field
    @Query("SELECT u FROM Users u WHERE u.isVendor = false AND u.created_at IS NOT NULL ORDER BY u.created_at DESC")
    List<Users> findRecentUsers();

    // Find recent vendors (last 30 days) - Fixed to use created_at string field
    @Query("SELECT u FROM Users u WHERE u.isVendor = true AND u.created_at IS NOT NULL ORDER BY u.created_at DESC")
    List<Users> findRecentVendors();
}