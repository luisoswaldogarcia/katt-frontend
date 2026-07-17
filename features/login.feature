Feature: Inicio de sesión
  Como usuario de Katt
  Quiero iniciar sesión en la aplicación
  Para acceder al dashboard y sus funcionalidades

  Background:
    Given que estoy en la página de inicio

  Scenario: Iniciar sesión con credenciales válidas
    When ingreso credenciales demo
    Then debo ver el dashboard con "Citas de hoy"
