```mermaid
flowchart TD
    %% ==================== EMISSOR (COLEIRA) ====================
    Bateria_mega["Bateria Li-ion 18650 3.7V"] 
    
    SU1_mega["Step-Up 3.7V → 5V"] 
    SU2_mega["Step-Up 3.7V → 5V"]
    
    Arduino_mega["Arduino Mega"] 
    
    MAX_mega["Sensor de Batimentos MAX30102"]
    LoRa_mega["Módulo LoRa (Emissor)"]
    GPS_mega["Módulo GPS NEO-6M"]
    
    Bateria_mega --> SU1_mega
    Bateria_mega --> SU2_mega
    SU1_mega --> Arduino_mega
    SU1_mega --> MAX_mega
    SU2_mega --> GPS_mega
    
    Arduino_mega <--> MAX_mega
    Arduino_mega <--> GPS_mega
    Arduino_mega <--> LoRa_mega

    %% ==================== RECEPTOR (TORRE) ====================
    Bateria_esp32["Bateria Lítio 12V 7Ah"] 
    
    SU1_esp32["Step-Down 12V → 5V"] 
    
    Esp32["ESP32-C6"] 
    Server["Servidor"]
    LoRa_esp32["Módulo LoRa (Receptor)"]

    Bateria_esp32 --> SU1_esp32
    SU1_esp32 --> Esp32
    Esp32 <--> LoRa_esp32
    Esp32 --> Server

    %% ==================== COMUNICAÇÃO ====================
    LoRa_mega <===>|"Comunicação LoRa "| LoRa_esp32

    %% ==================== CORES ====================
    classDef emissor fill:#ffcc99, stroke:#f39c12, stroke-width:1.5px, color:#333
    classDef receptor fill:#a3d8ff, stroke:#2980b9, stroke-width:2px, color:#333
    
    class Bateria_mega,SU1_mega,SU2_mega,Arduino_mega,MAX_mega,GPS_mega,LoRa_mega emissor
    class Bateria_esp32,SU1_esp32,Esp32,Server,LoRa_esp32 receptor