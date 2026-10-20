package com.littledokyhub.controller;

import com.littledokyhub.service.ProductoService;
import com.littledokyhub.service.RolService;
import com.littledokyhub.service.CategoriaService;
import com.littledokyhub.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class PageController {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaService categoriaService;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private RolService rolService;

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("favoritas", productoService.obtenerFavoritas());
        return "index";
    }

    @GetMapping("/categorias")
    public String categorias(Model model) {
        model.addAttribute("categorias", categoriaService.listar());
        model.addAttribute("clasicas", productoService.obtenerClasicas());
        model.addAttribute("especiales", productoService.obtenerEspeciales());
        model.addAttribute("bebidas", productoService.obtenerBebidas());
        return "shop/categorias";
    }

    @GetMapping("/detalles")
    public String detalles() {
        return "shop/detalles";
    }

    @GetMapping("/contacto")
    public String contacto() {
        return "contact/contacto";
    }

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("listaUsuarios", usuarioService.listar());
        return "account/login";
    }

    @PostMapping("/login")
    public String procesarLogin(@RequestParam("email") String email,
            @RequestParam("password") String password,
            org.springframework.web.servlet.mvc.support.RedirectAttributes flash) {
        var usuario = usuarioService.autenticar(email, password);
        if (usuario.isPresent()) {
            // Se valida contra el nombre del objeto Rol asociado
            if (usuario.get().getRol() != null && "ADMIN".equalsIgnoreCase(usuario.get().getRol().getNombre())) {
                return "redirect:/administracion";
            }
            return "redirect:/";
        }
        flash.addFlashAttribute("error", "Correo o contraseña incorrectos.");
        return "redirect:/login";
    }

    @GetMapping("/logout")
    public String logout() {
        return "redirect:/";
    }

    @GetMapping("/registro")
    public String registro() {
        return "account/create";
    }

    @PostMapping("/registro")
    public String procesarRegistro(@RequestParam("nombre") String nombre,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "telefono", required = false) String telefono,
            org.springframework.web.servlet.mvc.support.RedirectAttributes flash) {

        com.littledokyhub.model.Usuario nuevo = new com.littledokyhub.model.Usuario();
        nuevo.setNombre(nombre);
        nuevo.setEmail(email);
        nuevo.setPassword(password);
        nuevo.setTelefono(telefono != null ? telefono : "");
        nuevo.setActivo(true);

        com.littledokyhub.model.Rol rolCliente = rolService.listar().stream()
            .filter(r -> "CLIENTE".equalsIgnoreCase(r.getNombre()))
            .findFirst()
            .orElse(null);

        nuevo.setRol(rolCliente);

        boolean guardado = usuarioService.guardar(nuevo);

        if (!guardado) {
            flash.addFlashAttribute("error", "El correo electrónico ya se encuentra registrado.");
            return "redirect:/registro";
        }

        flash.addFlashAttribute("exito", "Cuenta creada exitosamente. Ya puedes iniciar sesión.");
        return "redirect:/login";
    }

    @GetMapping("/forgotpassword")
    public String forgotPassword() {
        return "account/forgotpassword";
    }

    @GetMapping("/verifycode")
    public String verifyCode() {
        return "account/verifycode";
    }

    @GetMapping("/resetpassword")
    public String resetPassword() {
        return "account/resetpassword";
    }

    @GetMapping("/administracion")
    public String administracion(Model model) {
        model.addAttribute("productos", productoService.listar());
        int nClasicas = productoService.obtenerClasicas().size();
        int nEspeciales = productoService.obtenerEspeciales().size();
        int nBebidas = productoService.obtenerBebidas().size();

        model.addAttribute("nClasicas", nClasicas);
        model.addAttribute("nEspeciales", nEspeciales);
        model.addAttribute("nBebidas", nBebidas);
        model.addAttribute("maxCategoria", Math.max(1, Math.max(nClasicas, Math.max(nEspeciales, nBebidas))));

        model.addAttribute("totalProductos", productoService.listar().size());
        model.addAttribute("categorias", categoriaService.listar());
        model.addAttribute("totalClientes", usuarioService.contarClientes());

        return "admin/admin";
    }
}