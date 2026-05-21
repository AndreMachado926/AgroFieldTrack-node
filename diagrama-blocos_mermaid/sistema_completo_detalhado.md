```mermaid
flowchart TD
    %% ==================== EMISSOR (COLEIRA) ====================
    
    Bateria_12v["Bateria Lítio\n12V 7Ah"] 
    
    step_down["Step-Down 12V → 5V"] 

    LoRa_c["Módulo LoRa (Receptor)"]
    Server_c["Servidor"]
    Esp32_c["ESP32"]

    
    Bateria["Bateria Li-ion 18650 3.7V"] 
    
    Step_Up_mega["Step Up 3.7V → 5V"] 
    Step_Up_gps["Step Up 3.7V → 5V"]

    Arduino["Arduino Mega"] 

    MAX["Sensor MAX30102\nBatimentos"]
    LoRa["Módulo LoRa\n(Emissor)"]
    GPS["Módulo GPS\nNEO-6M"]

    %% ==================== RAILS ====================
    rail3V3["+3.3V Rail"]
    GND["GND Rail\n(Massa)"]

    %% ==================== CONEXÕES ====================
    Bateria ===> Step_Up_mega
    Bateria ===> Step_Up_mega
    Bateria ===> Step_Up_gps
    Bateria ===> Step_Up_gps
    Step_Up_mega ===> Arduino
    Step_Up_gps ===> GPS

    Arduino ===> rail3V3
    rail3V3 ===> MAX
    rail3V3 ===> LoRa

    %% GND
    Step_Up_mega ===> GND
    Step_Up_gps ===> GND
    LoRa ===> GND
    MAX ===> GND
    GPS ===> GND

    %% Dados
    Arduino <==>MAX
    Arduino <==>GPS
    Arduino <==>LoRa

    Bateria_12v ===> step_down
    Bateria_12v ===> step_down

    step_down ===> Esp32_c
    step_down ===> Esp32_c

    Esp32_c <==> LoRa_c
    Esp32_c <==> LoRa_c
    Esp32_c <==> LoRa_c

    Esp32_c ==> Server_c
    
    LoRa ====> LoRa_c

    %% ==================== ESTILOS ====================
    classDef emissor fill:#f5e6ff, stroke:#9b59b6, stroke-width:2px, color:#333
    classDef torre fill:#e8f8f5, stroke:#16a085, stroke-width:2px, color:#333

    classDef rail3 fill:#fcf3cf, stroke:#b7950b, stroke-width:3px, color:#333
    classDef gnd fill:#f4ecf7, stroke:#7d3c98, stroke-width:3px, color:#333

    class Bateria,Step_Up_mega,Step_Up_gps,Arduino,MAX,LoRa,GPS emissor
    class rail3V3 rail3
    class GND gnd
    class Bateria_12v,step_down,Esp32_c,LoRa_c,Server_c torre

    %% ==================== CORES DAS SETAS ====================
    linkStyle 6,7,8,22 stroke:#f39c12, stroke-width:3px         %% 3.3V - Laranja
    linkStyle 14,15,16,21,24 stroke:#2ecc71, stroke-width:3px      %% Dados - Verde
    linkStyle 25 stroke:#8e44ad,stroke-width:5px,color:#8e44ad%% lora - roxo
    linkStyle 0,2,4,5,18,20 stroke:#e74c3c, stroke-width:3.5px     %% 5V - Vermelho
    linkStyle 1,3,9,10,11,12,13,17,19,23 stroke:#3498db, stroke-width:2.8px %% GND - Azul