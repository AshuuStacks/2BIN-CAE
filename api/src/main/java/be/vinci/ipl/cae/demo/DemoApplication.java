package be.vinci.ipl.cae.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main class of the application.
 * This class is the entry point of the Spring Boot application.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
public class DemoApplication {

  /**
   * Main method of the application.
   * This method starts the Spring Boot application.
   *
   * @param args the arguments passed to the application
   */
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }
}