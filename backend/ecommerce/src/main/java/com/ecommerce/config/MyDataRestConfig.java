package com.ecommerce.config;

import com.ecommerce.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import java.util.ArrayList;
import java.util.Set;
import java.util.List;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {

    @Value("${allowed.origins}")
    private String[] theAllowedOrigins;

    private EntityManager entityManager;

    @Autowired
    public MyDataRestConfig(EntityManager entityManager){
        this.entityManager=entityManager;
    }

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        HttpMethod[] theUnsupportedActions = {HttpMethod.DELETE,HttpMethod.PUT,HttpMethod.POST,HttpMethod.PATCH};
        disableHttpMethods(config, Product.class ,theUnsupportedActions);
        disableHttpMethods(config, ProductCategory.class ,theUnsupportedActions);
        disableHttpMethods(config, Country.class ,theUnsupportedActions);
        disableHttpMethods(config, State.class ,theUnsupportedActions);
        disableHttpMethods(config, Order.class,theUnsupportedActions);
        exposeIds(config);
        //configuro cors mapping
        cors.addMapping(config.getBasePath()+"/**").allowedOrigins(theAllowedOrigins);
    }

    private static void disableHttpMethods(RepositoryRestConfiguration config,Class theClass ,HttpMethod[] theUnsupportedActions) {
        config.getExposureConfiguration().forDomainType(theClass)
                .withItemExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions))
                .withCollectionExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions));
    }

    private void exposeIds(RepositoryRestConfiguration config) {
        //restituisce una lista di tute le classi delle entitá  dall'entity manager
        Set<EntityType<?>> entities= entityManager.getMetamodel().getEntities();
        //ora da qui possiamo creare una lista con i tipi di entitá
        List<Class> entityCasses =new ArrayList<>();
        for( EntityType entity : entities)
            entityCasses.add(entity.getJavaType());
        //esponiamo gli id delle entitá
        Class[] domainTypes = entityCasses.toArray(new Class[0]);
        config.exposeIdsFor(domainTypes);
    }

}
