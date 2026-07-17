Feature: Configuración del Sistema
  Como usuario owner de Katt
  Quiero configurar la empresa activa
  Para gestionar las organizaciones del sistema

  Background:
    Given que he iniciado sesión

  Scenario: Ver panel de sistema con empresa activa
    When navego a "/settings"
    And espero a que cargue la configuración
    And presiono el botón "Sistema"
    Then debo ver "Empresa activa"
    And debo ver "Owner (todos los módulos)"

  Scenario: Ver lista de empresas desde sistema
    When navego a "/settings"
    And espero a que cargue la configuración
    And presiono el botón "Sistema"
    Then debo ver mi empresa en la lista
