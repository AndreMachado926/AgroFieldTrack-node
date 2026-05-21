```mermaid
flowchart TD
    %% ==================== TORRE (RECEPTOR) ====================
    Bateria["Bateria Lítio\n12V 7Ah"] 
    
    SU5V["Step-Down\n12V → 5V"] 

    Esp32["ESP32-C6"] 
    LoRa["Módulo LoRa\n(Receptor)"]
    Server["Servidor"]

    %% ==================== CONEXÕES ====================
    Bateria ===> SU5V
    Bateria ===> SU5V

    SU5V ===> Esp32
    SU5V ===> Esp32

    Esp32 <--> LoRa
    Esp32 <--> LoRa
    Esp32 <--> LoRa

    Esp32 --> Server

    %% ==================== ESTILOS ====================
    classDef torre fill:#a3d8ff, stroke:#2980b9, stroke-width:2px, color:#333

    class Bateria,SU5V,Esp32,LoRa,Server torre

    %% ==================== CORES DAS SETAS ====================
    linkStyle 0,2,4 stroke:#e74c3c, stroke-width:3.5px     %% 5V Vermelho
    linkStyle 6,7 stroke:#2ecc71, stroke-width:3px       %% Dados Verde
    linkStyle 4 stroke:#f39c12, stroke-width:3px       %% 3.3V - Laranja
    linkStyle 1,3,5 stroke:#3498db, stroke-width:2.8px     %% GND - Azul
