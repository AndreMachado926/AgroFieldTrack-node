```mermaid
flowchart TD
    %% Bateria
    Bateria["Bateria Lítio 12V 7Ah"] 
    
    %% Step-ups
    SU1["Step-Up 3.7V → 5V"] 
    
    %% Arduino + periféricos
    Esp32["ESP32-C6-DEVKITC"] 
    Server["servidor"]
    LoRa["Módulo LoRa"]

    Bateria --> SU1
    SU1 --> Esp32
    Esp32 <--> LoRa
    Esp32 --> Server


    classDef cor fill:#a3d8ff, stroke:#2980b9, stroke-width:2px, color:#333
    class Bateria,SU1,Esp32,Server,LoRa cor
