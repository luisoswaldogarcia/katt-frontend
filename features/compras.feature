Feature: Gestión de Compras y Proveedores
  Como usuario de Katt
  Quiero gestionar proveedores
  Para administrar las compras a proveedores

  Background:
    Given que he iniciado sesión

  Scenario: Crear un proveedor
    When navego a "/compras"
    And presiono el botón "Proveedores"
    And presiono el botón flotante de nuevo proveedor
    And lleno el campo "Nombre *" con un nombre único
    And lleno el campo "Persona de contacto" con "Contacto E2E"
    And lleno el campo "Teléfono" con "5555000005"
    And lleno el campo "Email" con un email único
    And presiono el botón "Crear proveedor"
    Then el proveedor debe crearse exitosamente

  Scenario: Eliminar un proveedor
    When navego a "/compras"
    And presiono el botón "Proveedores"
    And busco el proveedor creado y presiono "Eliminar"
    And confirmo la eliminación
    Then el proveedor debe eliminarse exitosamente
