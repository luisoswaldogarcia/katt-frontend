Feature: Gestión de Usuarios (Doctores)
  Como usuario administrador de Katt
  Quiero gestionar usuarios
  Para administrar el personal del sistema

  Background:
    Given que he iniciado sesión

  Scenario: Crear un nuevo usuario
    When navego a "/doctor/alta"
    And lleno el campo "Nombre" con un nombre único
    And selecciono "Usuario" en el campo "Rol"
    And lleno el campo "Teléfono" con "5552000002"
    And lleno el campo "Email" con un email único
    And presiono el botón "Guardar"
    Then el usuario debe crearse exitosamente

  Scenario: Leer la lista de usuarios
    When navego a "/doctor"
    Then debo ver el usuario creado en la lista

  Scenario: Editar un usuario
    When navego a "/doctor"
    And hago clic en la fila del usuario creado
    And presiono el botón "Editar"
    And lleno el campo "Nombre" editando el nombre
    And presiono el botón "Actualizar" o "Guardar"
    Then el usuario debe actualizarse exitosamente

  Scenario: Eliminar un usuario
    When navego a "/doctor"
    And hago clic en la fila del usuario editado
    And presiono el botón "Eliminar"
    And confirmo la eliminación
    Then el usuario debe eliminarse exitosamente
