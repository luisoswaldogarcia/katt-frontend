Feature: Roles y permisos
  Como usuario de Katt
  Quiero que los roles tengan los permisos correctos
  Para garantizar la seguridad del sistema

  Background:
    Given que he iniciado sesión

  Scenario: Ver pestañas visibles en configuración según mi rol
    When navego a "/settings"
    And espero a que cargue la configuración
    Then se muestran las pestañas de configuración según mi rol

  Scenario: Ver enlaces en sidebar según mi rol
    When presiono el botón "Menú"
    Then el sidebar muestra los enlaces según mi rol
