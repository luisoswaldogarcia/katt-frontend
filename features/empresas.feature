Feature: Gestión de Empresas
  Como usuario administrador de Katt
  Quiero gestionar empresas
  Para administrar las organizaciones registradas

  Background:
    Given que he iniciado sesión

  Scenario: Crear una nueva empresa
    When navego a "/empresa/alta"
    And lleno el campo "Nombre" con un nombre único
    And lleno el campo "RFC" con "XAXX010101001"
    And lleno el campo "Teléfono" con "5554000004"
    And lleno el campo "Email" con un email único
    And lleno el campo "Dirección" con "Dirección E2E test"
    And presiono el botón "Guardar"
    Then la empresa debe crearse exitosamente

  Scenario: Leer la lista de empresas
    When navego a "/empresa"
    Then debo ver la empresa creada en la lista

  Scenario: Editar una empresa
    When navego a "/empresa"
    And hago clic en la fila de la empresa creada
    And presiono el botón "Editar"
    And lleno el campo "Nombre" editando el nombre
    And presiono el botón "Actualizar" o "Guardar"
    Then la empresa debe actualizarse exitosamente

  Scenario: Eliminar una empresa
    When navego a "/empresa"
    And hago clic en la fila de la empresa editada
    And presiono el botón "Eliminar"
    And confirmo la eliminación
    Then la empresa debe eliminarse exitosamente
