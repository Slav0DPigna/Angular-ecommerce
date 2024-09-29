package com.ecommerce.dao;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;

@RepositoryRestResource
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByCategoryId(@Param("id") Long id, Pageable pageable);
    /*Questo scritto sopra é definito query method ed é come se avessimo scritto una query in sql del tipo
    * SELECT * FROM product where category_id=?*/

    Page<Product> findByNameContaining(@Param("name") String name, Pageable pageable);
}
