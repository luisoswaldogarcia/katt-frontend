Feature: Gestión de Clientes (Pacientes)
  Como usuario de Katt
  Quiero gestionar clientes
  Para mantener el registro de pacientes

  Background:
    Given que he iniciado sesión

  Scenario: Crear un nuevo paciente
    When navego a "/paciente/alta"
    And lleno el campo "Nombre" con un nombre único
    And lleno el campo "Usuario" con "Dev User"
    And lleno el campo "Teléfono" con "5551000001"
    And lleno el campo "Email" con un email único
    And presiono el botón "Guardar"
    Then el paciente debe crearse exitosamente

  Scenario: Leer la lista de pacientes
    When navego a "/paciente"
    Then debo ver el paciente creado en la lista

  Scenario: Editar un paciente existente
    When navego a "/paciente"
    And hago clic en la fila del paciente creado
    And presiono el botón "Editar"
    And lleno el campo "Nombre" editando el nombre
    And presiono el botón "Actualizar" o "Guardar"
    Then el paciente debe actualizarse exitosamente

  Scenario: Eliminar un paciente
    When navego a "/paciente"
    And hago clic en la fila del paciente editado
    And presiono el botón "Eliminar"
    Then el paciente debe eliminarse exitosamente
