Feature: Configuración de Documentos
  Como usuario administrador de Katt
  Quiero configurar los tipos de documento
  Para gestionar la documentación por módulo

  Background:
    Given que he iniciado sesión

  Scenario: Ver panel de documentos con catálogo y asignación
    When navego a "/settings"
    And espero a que cargue la configuración
    And presiono el botón "Documentos"
    Then debo ver "Catálogo de tipos"
    And debo ver "Asignar a módulo"
