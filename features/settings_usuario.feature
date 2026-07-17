Feature: Configuración de Usuario
  Como usuario de Katt
  Quiero configurar mi apariencia
  Para personalizar la experiencia visual

  Background:
    Given que he iniciado sesión

  Scenario: Navegar a configuración de usuario
    When navego a "/settings"
    Then debo ver "Configuración"
    And debo ver "Usuario"
    And debo ver "Apariencia"
    And debo ver "Tema"
