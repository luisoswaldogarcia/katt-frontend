Feature: Configuración de Módulos
  Como usuario administrador de Katt
  Quiero gestionar el catálogo de módulos
  Para definir los precios y descripciones

  Background:
    Given que he iniciado sesión

  Scenario: Ver panel de módulos con catálogo
    When navego a "/settings"
    And espero a que cargue la configuración
    And presiono el botón "Módulos"
    Then debo ver "Pacientes"
    And debo ver "Inventario"
    And debo ver "Agente"
