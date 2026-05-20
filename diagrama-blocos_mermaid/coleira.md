```mermaid
flowchart TD
    %% Bateria
    Bateria["Bateria Li-ion 18650 3.7V"] 
    
    %% Step-ups
    SU1["Step-Up 3.7V → 5V"] 
    SU2["Step-Up 3.7V → 5V"]
    
    %% Arduino + periféricos
    Arduino["Arduino Mega"] 
    
    MAX["Sensor de Batimentos(MAX30102)"]
    LoRa["Módulo LoRa"]
    GPS["Módulo GPS (NEO-6M) "]
    
    %% Conexões de potência
    Bateria --> SU1
    Bateria --> SU2
    SU1 --> Arduino
    SU2 --> GPS
    
    %% Conexões de dados
    Arduino <--> MAX
    Arduino <--> LoRa
    Arduino <--> GPS

    classDef cor fill:#ffcc99, stroke:#f39c12, stroke-width:1.5px, color:#333
    class Bateria,SU1,SU2,MAX,GPS,LoRa,Arduino cor

