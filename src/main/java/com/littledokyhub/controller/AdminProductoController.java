package com.littledokyhub.controller;

import com.littledokyhub.model.Producto;
import com.littledokyhub.service.CategoriaService;
import com.littledokyhub.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/administracion/productos")
public class AdminProductoController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaService categoriaService;

    @PostMapping("/guardar")
    public String guardar(
            @Valid @ModelAttribute("producto") Producto producto,
            BindingResult bindingResult,
            RedirectAttributes flash) {

        // Si Spring Validator encuentra errores de anotaciones (@NotBlank, @DecimalMin, etc.)
        if (bindingResult.hasErrors()) {
            // Capturamos el primer error para mostrarlo en la vista administrativa
            String mensajeError = bindingResult.getAllErrors().get(0).getDefaultMessage();
            flash.addFlashAttribute("error", "Error de validación: " + mensajeError);
            return "redirect:/administracion#productos";
        }

        // Validación de imagen por defecto si viene vacía
        if (producto.getImagenUrl() == null || producto.getImagenUrl().isBlank()) {
            producto.setImagenUrl("/images/logo.png");
        }

        boolean esNuevo = (producto.getId() == null);
        
        // El servicio procesa el guardado mediante JPA
        if (productoService.guardar(producto)) {
            flash.addFlashAttribute("exito",
                    esNuevo ? "Producto creado correctamente." : "Producto actualizado correctamente.");
        } else {
            flash.addFlashAttribute("error", "El producto que intentas editar no existe.");
        }
        
        return "redirect:/administracion#productos";
    }

    @PostMapping("/{id}/eliminar")
    public String eliminar(@PathVariable Integer id, RedirectAttributes flash) {
        if (productoService.eliminar(id)) {
            flash.addFlashAttribute("exito", "Producto eliminado correctamente.");
        } else {
            flash.addFlashAttribute("error", "No se encontró el producto a eliminar.");
        }
        return "redirect:/administracion#productos";
    }
}