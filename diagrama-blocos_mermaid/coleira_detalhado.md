```mermaid
flowchart TD
    %% ==================== EMISSOR (COLEIRA) ====================
    Bateria["Bateria Li-ion\n18650 3.7V"] 
    
    SU5V["Step-Up 1\n3.7V → 5V"] 
    SU_GPS["Step-Up 2\n3.7V → 5V\n(para GPS)"]

    Arduino["Arduino Mega"] 

    MAX["Sensor MAX30102\nBatimentos"]
    LoRa["Módulo LoRa\n(Emissor)"]
    GPS["Módulo GPS\nNEO-6M"]

    %% ==================== RAILS ====================
    Positive3V3["+3.3V Rail"]
    GND["GND Rail\n(Massa)"]

    %% ==================== CONEXÕES ====================
    Bateria ===> SU5V
    Bateria ===> SU_GPS

    SU5V ===> Arduino
    SU_GPS ===> GPS

    Arduino ===> Positive3V3
    Positive3V3 ===> MAX
    Positive3V3 ===> LoRa

    %% GND
    SU5V ===> GND
    SU_GPS ===> GND
    LoRa ===> GND
    MAX ===> GND
    GPS ===> GND

    %% Dados
    Arduino <==>MAX
    Arduino <==>GPS
    Arduino <==>LoRa

    %% ==================== ESTILOS ====================
    classDef emissor fill:#ffcc99, stroke:#f39c12, stroke-width:2px, color:#333
    classDef rail3 fill:#d5f4e6, stroke:#27ae60, stroke-width:3px, color:#333
    classDef gnd fill:#e5e5e5, stroke:#2c3e50, stroke-width:3px, color:#333

    class Bateria,SU5V,SU_GPS,Arduino,MAX,LoRa,GPS emissor
    class Positive3V3 rail3
    class GND gnd

    %% ==================== CORES DAS SETAS ====================
    linkStyle 0,1,2,3 stroke:#e74c3c, stroke-width:3.5px     %% 5V - Vermelho
    linkStyle 4,5,6 stroke:#f39c12, stroke-width:3px         %% 3.3V - Laranja
    linkStyle 7,8,9,10,11 stroke:#3498db, stroke-width:2.8px %% GND - Azul
    linkStyle 12,13,14 stroke:#2ecc71, stroke-width:3px      %% Dados - Verde