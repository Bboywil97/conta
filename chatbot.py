import tkinter as tk
from tkinter import ttk

# Diccionario de preguntas y respuestas
faq_nif = {
    "¿Qué son las NIF?":
        "Son las Normas de Información Financiera que regulan la elaboración y presentación de la información contable en México.",
    "¿Quién emite las NIF?":
        "Las NIF son emitidas por el CINIF (Consejo Mexicano para la Investigación y Desarrollo de Normas de Información Financiera).",
    "¿Para qué sirven las NIF?":
        "Sirven para establecer los criterios y lineamientos que deben seguirse al preparar estados financieros.",
    "¿Qué estructura tienen las NIF?":
        "Las NIF se dividen en: Marco Conceptual, Normas Particulares y Boletines Supletorios.",
    "¿Qué es el Marco Conceptual?":
        "Es el conjunto de fundamentos que sustentan la emisión de las NIF y guían su aplicación.",
    "¿Qué son las Normas Particulares?":
        "Son reglas específicas para ciertas operaciones o situaciones contables (por ejemplo, NIF B-3 para el Estado de Resultados)."
}

# Función para simular mensaje tipo chat
def agregar_mensaje(remitente, mensaje, color_fondo):
    frame = tk.Frame(chat_frame, bg="#ffffff")
    etiqueta = tk.Label(frame, text=f"{remitente}: {mensaje}",
                        bg=color_fondo, fg="black",
                        wraplength=400, justify="left",
                        padx=10, pady=5, anchor="w")
    etiqueta.pack(anchor="w", pady=2)
    frame.pack(anchor="w" if remitente == "Tú" else "e", padx=10, pady=2, fill="x")

    # Scroll automático
    chat_canvas.update_idletasks()
    chat_canvas.yview_moveto(1.0)

# Función cuando se selecciona una pregunta
def responder():
    pregunta = pregunta_var.get()
    if pregunta in faq_nif:
        agregar_mensaje("Tú", pregunta, "#dcf8c6")  # Verde claro (usuario)
        respuesta = faq_nif[pregunta]
        ventana.after(500, lambda: agregar_mensaje("Bot", respuesta, "#f1f0f0"))  # Gris claro (bot)

# Crear ventana principal
ventana = tk.Tk()
ventana.title("Chatbot NIF")
ventana.geometry("500x600")
ventana.config(bg="#ededed")

# Encabezado
tk.Label(ventana, text="📘 Chat NIF - Preguntas Frecuentes", font=("Helvetica", 16, "bold"), bg="#075E54", fg="white").pack(fill="x")

# Contenedor para el chat con scroll
chat_frame_holder = tk.Frame(ventana)
chat_frame_holder.pack(fill="both", expand=True, padx=5, pady=5)

chat_canvas = tk.Canvas(chat_frame_holder, bg="white")
scrollbar = ttk.Scrollbar(chat_frame_holder, orient="vertical", command=chat_canvas.yview)
chat_frame = tk.Frame(chat_canvas, bg="white")

chat_frame.bind(
    "<Configure>",
    lambda e: chat_canvas.configure(
        scrollregion=chat_canvas.bbox("all")
    )
)

chat_canvas.create_window((0, 0), window=chat_frame, anchor="nw")
chat_canvas.configure(yscrollcommand=scrollbar.set)

chat_canvas.pack(side="left", fill="both", expand=True)
scrollbar.pack(side="right", fill="y")

# Selector de preguntas
pregunta_var = tk.StringVar()
pregunta_var.set("Selecciona una pregunta")
menu_preguntas = ttk.OptionMenu(ventana, pregunta_var, *faq_nif.keys())
menu_preguntas.pack(pady=5)

# Botón para enviar pregunta
boton = ttk.Button(ventana, text="Enviar", command=responder)
boton.pack(pady=5)

# Iniciar loop
ventana.mainloop()
