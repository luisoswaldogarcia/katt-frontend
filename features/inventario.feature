Feature: Gestión de Inventario
  Como usuario de Katt
  Quiero gestionar el inventario
  Para controlar los productos y su stock

  Background:
    Given que he iniciado sesión

  Scenario: Crear un item de inventario
    When navego a "/inventario/alta"
    And lleno el campo "Nombre" con un nombre único
    And selecciono "Medicamento" en el campo "Categoría"
    And lleno el campo "Cantidad" con "30"
    And lleno el campo "Unidad" con "kg"
    And lleno el campo "Precio unitario" con "99.99"
    And presiono el botón "Guardar"
    Then el item debe crearse exitosamente

  Scenario: Leer la lista de inventario
    When navego a "/inventario"
    Then debo ver el item creado en la lista

  Scenario: Editar un item de inventario
    When navego a "/inventario"
    And hago clic en la fila del item creado
    And presiono el botón "Editar"
    And lleno el campo "Nombre" editando el nombre
    And presiono el botón "Actualizar" o "Guardar"
    Then el item debe actualizarse exitosamente

  Scenario: Eliminar un item de inventario
    When navego a "/inventario"
    And hago clic en la fila del item editado
    And presiono el botón "Eliminar"
    And confirmo la eliminación
    Then el item debe eliminarse exitosamente
