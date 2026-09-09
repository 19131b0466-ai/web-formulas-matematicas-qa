export type PhysCopy = { idea: string; tryIt: string };

const FALLBACK: PhysCopy = {
  idea: 'Explora la fórmula moviendo los controles: la escena y los números están acoplados.',
  tryIt: 'Cambia un parámetro y observa qué se mueve y qué se conserva.',
};

const COPY: Record<string, PhysCopy> = {
  vector_magnitude: {
    idea: 'Vas a ver que el módulo es la longitud de la flecha: la hipotenusa del triángulo de componentes, no |Ax| + |Ay|.',
    tryIt: 'Arrastra la punta o mueve Ax y Ay. Compara √(Ax² + Ay²) con la longitud dibujada.',
  },
  unit_vector: {
    idea: 'Vas a ver que normalizar un vector deja la dirección igual y fija la longitud en 1.',
    tryIt: 'Alarga o acorta A: ûA no se sale de la circunferencia unidad.',
  },
  vector_decomposition: {
    idea: 'Vas a ver que un vector en el plano son dos catetos: A cos θ horizontal y A sen θ vertical.',
    tryIt: 'Gira θ. En 0° solo hay Ax; en 90° solo Ay; en 180° Ax es negativo.',
  },
  'vector_decomposition.position': {
    idea: 'Vas a ver que la posición es un vector desde el origen hasta el punto: r = x î + y ĵ.',
    tryIt: 'Mueve el punto: las coordenadas son las componentes de r.',
  },
  vector_addition: {
    idea: 'Vas a ver que sumar vectores es sumar componentes: punta-cola y paralelogramo construyen el mismo R.',
    tryIt: 'Cambia de construcción: R no se mueve. Arrastra A o B y mira Rx = Ax + Bx.',
  },
  dot_product: {
    idea: 'Vas a ver que el producto escalar mide cuánto apunta un vector en la dirección del otro: máximo si van juntos, cero si son perpendiculares, negativo si se oponen.',
    tryIt: 'Pon 90°: el producto se anula y la proyección se reduce a un punto. Abre el ángulo y mira el signo.',
  },
  cross_product: {
    idea: 'Vas a ver que el producto vectorial es un vector perpendicular al plano de A y B, y que su módulo es el área del paralelogramo.',
    tryIt: 'Pon θ = 0°: el área y el producto se anulan. En 90° el área es máxima.',
  },
  'cross_product.torque': {
    idea: 'Vas a ver que el torque τ = r × F es máximo cuando la fuerza es perpendicular a r, y nulo si F va a lo largo de r.',
    tryIt: 'Alinea F con r: τ = 0 y no hay giro.',
  },
  'cross_product.angular_momentum': {
    idea: 'Vas a ver que L = r × p usa la misma geometría: momento lineal cruzado con la posición.',
    tryIt: 'Gira p respecto de r: L es máximo a 90° y se anula si son paralelos.',
  },
  'kinematics_1d.displacement': {
    idea: 'Vas a ver que el desplazamiento es xf − xi, con signo: no es lo mismo que la distancia recorrida.',
    tryIt: 'Pon xf < xi: Δx apunta a la izquierda y el número es negativo.',
  },
  'kinematics_1d.avg_velocity': {
    idea: 'Vas a ver que la velocidad media es la pendiente de la cuerda que une dos instantes, no la pendiente local.',
    tryIt: 'Acorta Δt: la cuerda se parece a la tangente.',
  },
  'kinematics_1d.avg_speed': {
    idea: 'Vas a ver que la rapidez media usa la distancia total, no el desplazamiento: puedes volver al origen con rapidez media > 0 y vmed = 0.',
    tryIt: 'Haz ir y volver al mismo x: Δx = 0 y dtotal > 0.',
  },
  'kinematics_1d.inst_velocity': {
    idea: 'Vas a ver que la velocidad instantánea es la pendiente de la tangente a x(t).',
    tryIt: 'Mueve t y compara la pendiente dibujada con el número v(t).',
  },
  'kinematics_1d.avg_accel': {
    idea: 'Vas a ver que la aceleración media es el cambio de velocidad por unidad de tiempo: pendiente de la cuerda en v(t).',
    tryIt: 'Igual que en velocidad media, ahora sobre v(t).',
  },
  'kinematics_1d.inst_accel': {
    idea: 'Vas a ver que la aceleración instantánea es la pendiente de v(t), igual a la derivada segunda de x(t).',
    tryIt: 'Con a constante, v(t) es una recta y la pendiente no cambia.',
  },
  'kinematics_1d.mru': {
    idea: 'Vas a ver que si a = 0, x = x0 + v t es una recta y v no cambia.',
    tryIt: 'Cambia v: la pendiente de x(t) es exactamente ese valor.',
  },
  'kinematics_1d.mrua_v': {
    idea: 'Vas a ver que con a constante la velocidad cambia linealmente: v = v0 + a t.',
    tryIt: 'Pon a < 0: v(t) baja y puede cruzar cero (cambio de sentido).',
  },
  'kinematics_1d.mrua_x': {
    idea: 'Vas a ver que la posición con aceleración constante es una parábola en el tiempo.',
    tryIt: 'Cambia el signo de a y de v0: la concavidad sigue el signo de a.',
  },
  'kinematics_1d.torricelli': {
    idea: 'Vas a ver que Torricelli relaciona velocidades y desplazamiento sin usar t.',
    tryIt: 'Ajusta a y Δx; el t no aparece en el caption.',
  },
  'kinematics_1d.mrua_avg': {
    idea: 'Vas a ver que, con a constante, Δx es la velocidad media por el tiempo.',
    tryIt: 'Compara el área del trapecio v(t) con el rectángulo de altura (v0+vf)/2.',
  },
  'kinematics_1d.var_a': {
    idea: 'Vas a ver que v(t) = v(t0) + ∫ a(τ) dτ: el área bajo a(t) es el cambio de velocidad.',
    tryIt: 'Elige el perfil escalón: v gana una rampa solo mientras a ≠ 0.',
  },
  'kinematics_1d.var_v': {
    idea: 'Vas a ver que x(t) = x(t0) + ∫ v(τ) dτ: el área bajo v(t) es el desplazamiento.',
    tryIt: 'Área sobre el eje t suma; área bajo el eje resta (signo).',
  },
  kinematics_1d: {
    idea: 'Vas a ver que v es la pendiente de x(t), a es la pendiente de v(t) y el área bajo v es Δx.',
    tryIt: 'Reproduce y observa el punto naranja: escena y gráficas comparten el mismo t.',
  },
  'free_fall.position': {
    idea: 'Vas a ver que, con el eje hacia arriba, la posición es y = y0 + v0y t − ½ g t²: el término de g resta.',
    tryIt: 'Lanza hacia arriba y observa la parábola y(t). En la cima vy = 0 y y es máximo.',
  },
  'free_fall.velocity': {
    idea: 'Vas a ver que vy baja en g metros por segundo cada segundo (vy = v0y − g t).',
    tryIt: 'Mira la recta vy(t): la pendiente es −g, no +g.',
  },
  'free_fall.torricelli': {
    idea: 'Vas a ver la relación vy² = v0y² − 2 g Δy sin leer el reloj.',
    tryIt: 'Compara el número vy² con v0y² − 2g(y − y0) en cada instante.',
  },
  'free_fall.hmax': {
    idea: 'Vas a ver que la altura extra respecto del lanzamiento es v0²/(2g), con vy = 0 arriba.',
    tryIt: 'Marca la cima: H coincide con v0²/(2g).',
  },
  'free_fall.t_up': {
    idea: 'Vas a ver que el tiempo de subida es v0/g: el tiempo que tarda vy en llegar a cero.',
    tryIt: 'En la cima, t vale v0/g.',
  },
  'free_fall.t_flight': {
    idea: 'Vas a ver que, si vuelves a la misma altura, el vuelo dura el doble del tiempo de subida.',
    tryIt: 'Compara t_vuelo con 2 t_subida.',
  },
  free_fall: {
    idea: 'Vas a ver que, con el eje hacia arriba, ay = −g: sube, se detiene y baja simétricamente si vuelve a y0.',
    tryIt: 'Reproduce el lanzamiento y mira vy = 0 en la cima.',
  },
  'velocity_accel_2d.displacement': {
    idea: 'Vas a ver que el desplazamiento Δr es la cuerda del origen inicial al final, no el camino.',
    tryIt: 'En la circunferencia, Δr es una cuerda; el arco es más largo.',
  },
  'velocity_accel_2d.avg_velocity': {
    idea: 'Vas a ver que vmed = Δr/Δt va en la dirección de esa cuerda.',
    tryIt: 'Acorta el intervalo: vmed se acerca a la tangente.',
  },
  'velocity_accel_2d.inst_velocity': {
    idea: 'Vas a ver que la velocidad instantánea es tangente a la trayectoria: apunta hacia donde el móvil sigue, no hacia el origen.',
    tryIt: 'En la circunferencia, v es tangente; no apunta al centro.',
  },
  'velocity_accel_2d.acceleration': {
    idea: 'Vas a ver que a = dv/dt puede tener componente normal (cambia dirección) y tangencial (cambia rapidez).',
    tryIt: 'Compara circunferencia (a hacia el centro) y recta (a paralela a v o cero).',
  },
  velocity_accel_2d: {
    idea: 'Vas a ver que v es tangente a la trayectoria y a no tiene por qué serlo.',
    tryIt: 'Cambia de curva y observa las flechas en la partícula.',
  },
  'projectile_motion.range': {
    idea: 'Vas a ver que el alcance en suelo horizontal es R = v0² sen(2θ)/g: máximo a 45°, y 30° y 60° llegan igual de lejos.',
    tryIt: 'Pon 30° y 60° con el mismo v0: R coincide; H no.',
  },
  'projectile_motion.components': {
    idea: 'Vas a ver que v0 se parte en v0 cos θ (nunca cambia) y v0 sen θ (sí cambia por g).',
    tryIt: 'En t = 0 las dos componentes forman el ángulo θ con el suelo.',
  },
  'projectile_motion.x': {
    idea: 'Vas a ver que x = (v0 cos θ) t es MRU: x(t) es una recta.',
    tryIt: 'Mira x(t) debajo de la escena: pendiente constante.',
  },
  'projectile_motion.y': {
    idea: 'Vas a ver que y = (v0 sen θ) t − ½ g t² es la caída libre vertical.',
    tryIt: 'y(t) es una parábola; x(t) no.',
  },
  'projectile_motion.vy': {
    idea: 'Vas a ver que vy = v0 sen θ − g t se anula en la cima; no se queda en v0 sen θ.',
    tryIt: 'En t_max, vy vale 0.',
  },
  'projectile_motion.vx': {
    idea: 'Vas a ver que vx = v0 cos θ es constante: las flechas horizontales tienen la misma longitud en todo el vuelo.',
    tryIt: 'Compara vx al inicio y al final.',
  },
  'projectile_motion.tmax': {
    idea: 'Vas a ver que tmax = v0 sen θ / g es el instante en que vy = 0.',
    tryIt: 'Pausa en la cima y lee t.',
  },
  'projectile_motion.hmax': {
    idea: 'Vas a ver que H = v0² sen²θ / (2g) es la altura adicional sobre el lanzamiento.',
    tryIt: 'Sube θ: H crece aunque R no siempre lo haga.',
  },
  'projectile_motion.tflight': {
    idea: 'Vas a ver que, al volver a y = 0, el vuelo dura 2 tmax.',
    tryIt: 'Compara t_vuelo con 2 tmax.',
  },
  projectile_motion: {
    idea: 'Vas a ver que el proyectil combina MRU horizontal (ax = 0) y caída vertical (ay = −g).',
    tryIt: 'Reproduce y sigue las flechas vx y vy sobre la parábola.',
  },
  relative_velocity: {
    idea: 'Vas a ver que la velocidad respecto de A se obtiene sumando la velocidad respecto de B y la de B respecto de A.',
    tryIt: 'En «cruzar el río», apunta la barca perpendicular a la orilla: respecto de tierra la trayectoria se desvía aguas abajo.',
  },
  newton_second: {
    idea: 'Vas a ver que la aceleración la fija la suma de fuerzas dividida por la masa, no la fuerza «más grande» por sí sola.',
    tryIt: 'Pon dos fuerzas opuestas: si se cancelan, a = 0 aunque cada flecha sea grande. Sube m: el mismo ΣF produce menos a.',
  },
  'newton_second.inertia': {
    idea: 'Vas a ver que si ΣF = 0, el cuerpo no se frena solo: sigue en reposo o con v constante.',
    tryIt: 'Anula la fuerza neta con v ≠ 0: el bloque sigue a velocidad constante.',
  },
  'newton_second.weight': {
    idea: 'Vas a ver que el peso es mg hacia abajo: más masa, más flecha, misma g.',
    tryIt: 'Sube m: Fg crece y N en la mesa también, si hay superficie.',
  },
  newton_third: {
    idea: 'Vas a ver que acción y reacción son opuestas e iguales, y que no se cancelan porque no están en el mismo cuerpo.',
    tryIt: 'Mira el DCL de A: solo aparece FB→A. La de A sobre B está en el otro diagrama.',
  },
  friction: {
    idea: 'Vas a ver que la fricción estática no es μs N siempre: vale lo que haga falta hasta el máximo μs N.',
    tryIt: 'Sube Fapl despacio: fs la iguala. Al superar μs N, el bloque arranca.',
  },
  'friction.kinetic': {
    idea: 'Vas a ver que, una vez desliza, fk = μk N es constante (aquí) y se opone a la velocidad.',
    tryIt: 'Supera el umbral estático: la barra salta de fs a fk.',
  },
  hooke: {
    idea: 'Vas a ver que la fuerza del resorte tira hacia el equilibrio y vale kx en módulo: Fx = −kx.',
    tryIt: 'Estira y comprime: la flecha cambia de sentido y el punto (x, F) recorre la recta.',
  },
  inclined_plane: {
    idea: 'Vas a ver que el peso se parte respecto del plano: mg sen θ empuja cuesta abajo y mg cos θ determina la normal.',
    tryIt: 'Sube θ: crece la paralela y baja la normal. En 0° no hay paralela.',
  },
  circular_motion: {
    idea: 'Vas a ver que, aunque la rapidez sea constante, hay aceleración hacia el centro: ac = v²/r = ω² r.',
    tryIt: 'Sube v a r fijo: ac crece con v². La flecha naranja no apunta «hacia fuera».',
  },
  'circular_motion.dtheta': {
    idea: 'Vas a ver que Δθ = θf − θi es el arco recorrido en radianes.',
    tryIt: 'Avanza el punto y lee el arco sombreado.',
  },
  'circular_motion.omega_avg': {
    idea: 'Vas a ver que ωmed = Δθ/Δt es el arco por unidad de tiempo.',
    tryIt: 'Compara ωmed con ω instantánea cuando α = 0.',
  },
  'circular_motion.omega': {
    idea: 'Vas a ver que ω = dθ/dt es la rapidez a la que crece el ángulo.',
    tryIt: 'Sube ω: el punto da más vueltas en el mismo tiempo.',
  },
  'circular_motion.v_omega_r': {
    idea: 'Vas a ver que v = ω r: más lejos del eje, más rapidez lineal a igual ω.',
    tryIt: 'Sube r a ω fijo: v crece.',
  },
  'circular_motion.omega_freq': {
    idea: 'Vas a ver que ω = 2π f = 2π/T.',
    tryIt: 'Lee T y f a la vez que ω.',
  },
  'circular_motion.Fc': {
    idea: 'Vas a ver que Fc = m ac es la componente radial neta (tensión, gravedad, …), no una fuerza extra en el DCL.',
    tryIt: 'Sube m o v: Fc crece. No añadas una flecha «centrífuga» al DCL.',
  },
  'circular_motion.tangential': {
    idea: 'Vas a ver que at = α r cambia la rapidez; ac cambia la dirección.',
    tryIt: 'Pon α ≠ 0: aparece una flecha tangente además de la radial.',
  },
  'circular_motion.alpha': {
    idea: 'Vas a ver que α = dω/dt es el análogo de a = dv/dt.',
    tryIt: 'Con α constante, ω(t) es una recta.',
  },
  'circular_motion.omega_alpha': {
    idea: 'Vas a ver que ωf = ω0 + α t, igual que v = v0 + a t.',
    tryIt: 'La flecha at aparece si α ≠ 0.',
  },
  'circular_motion.theta_alpha': {
    idea: 'Vas a ver que θ, ω, α cumplen las mismas relaciones que x, v, a del MRUA.',
    tryIt: 'θ(t) es una parábola si α es constante.',
  },
  'circular_motion.ang_torricelli': {
    idea: 'Vas a ver ωf² = ω0² + 2 α Δθ, sin el tiempo explícito.',
    tryIt: 'Compara con Torricelli lineal vf² = v0² + 2 a Δx.',
  },
  moment_of_inertia: {
    idea: 'Vas a ver que el momento de inercia suma m r²: alejar una masa del eje sube I aunque m no cambie.',
    tryIt: 'Acerca todas las masas al eje: I cae.',
  },
  'moment_of_inertia.continuous': {
    idea: 'Vas a ver que una varilla es el límite de muchas partículas: I = ∫ r² dm.',
    tryIt: 'Compara la suma discreta con la I de varilla (1/12) M L² respecto del centro.',
  },
  'moment_of_inertia.parallel_axis': {
    idea: 'Vas a ver que un eje paralelo no por el CM añade M d².',
    tryIt: 'Aumenta d: I crece con d².',
  },
  torque: {
    idea: 'Vas a ver que Στ = I α es la segunda ley para la rotación: más I, menos α a igual torque.',
    tryIt: 'Sube I: el disco gana ω más despacio.',
  },
  rolling: {
    idea: 'Vas a ver que, si no desliza, vCM = R ω y la energía se parte en traslación más rotación.',
    tryIt: 'Elige aro vs disco a igual vCM: el aro guarda más fracción en rotación.',
  },
  'rolling.krot': {
    idea: 'Vas a ver que Krot = ½ I ω² es la parte que gira.',
    tryIt: 'Sube I a igual ω: Krot crece.',
  },
  angular_momentum: {
    idea: 'Vas a ver que, sin torque externo, L se conserva: al reducir I, ω sube para que Iω no cambie.',
    tryIt: 'Recoge las masas: el disco gira más rápido y L del caption no cambia.',
  },
  'angular_momentum.L_Iomega': {
    idea: 'Vas a ver que L = I ω para un eje fijo.',
    tryIt: 'Cambia I u ω: el producto es L.',
  },
  'angular_momentum.tau_dL': {
    idea: 'Vas a ver que si aplicas un τ, L deja de ser constante: τ = dL/dt.',
    tryIt: 'Activa un torque: L ya no se conserva.',
  },
  work_constant: {
    idea: 'Vas a ver que el trabajo de una fuerza constante es F d cos θ: solo cuenta la componente a lo largo del desplazamiento.',
    tryIt: 'Pon 90°: W = 0 aunque F y d no sean cero. En 180° el trabajo es negativo.',
  },
  'work_constant.power_avg': {
    idea: 'Vas a ver que la potencia media es W / Δt.',
    tryIt: 'Mismo trabajo en menos tiempo: más vatios.',
  },
  'work_constant.power_inst': {
    idea: 'Vas a ver que la potencia instantánea es F · v: a igual F, más rapidez, más vatios.',
    tryIt: 'Alinea F y v: P es máxima; a 90°, P = 0.',
  },
  work_variable: {
    idea: 'Vas a ver que, si F cambia a lo largo del camino, el trabajo es el área bajo F(x), no F·Δx con un solo valor de F.',
    tryIt: 'En el resorte, compara ∫₀ˣ k x dx = ½ k x² con el área del triángulo.',
  },
  potential_force: {
    idea: 'Vas a ver que la fuerza conservativa apunta cuesta abajo en U(x): Fx = −dU/dx.',
    tryIt: 'En el pozo, a la derecha del mínimo F tira a la izquierda.',
  },
  'potential_force.conservative_work': {
    idea: 'Vas a ver que el trabajo conservativo es Ui − Uf: bajar en U da Wc > 0.',
    tryIt: 'Desliza x: Wc = −ΔU.',
  },
  mechanical_energy: {
    idea: 'Vas a ver que, sin fricción, K + U no cambia: lo que pierde U lo gana K.',
    tryIt: 'Suelta desde lo alto: arriba todo U, abajo todo K, la suma plana.',
  },
  'mechanical_energy.kinetic': {
    idea: 'Vas a ver que K = ½ m v² crece con v², no con v.',
    tryIt: 'Duplica v: K se multiplica por 4.',
  },
  'mechanical_energy.grav': {
    idea: 'Vas a ver que Ug = m g y (eje y arriba, g constante).',
    tryIt: 'Sube y: U crece; K baja si Emec se conserva.',
  },
  'mechanical_energy.spring': {
    idea: 'Vas a ver que Us = ½ k x².',
    tryIt: 'En los extremos del MAS, casi toda la energía es elástica.',
  },
  'mechanical_energy.work_energy': {
    idea: 'Vas a ver que el trabajo neto es exactamente ΔK.',
    tryIt: 'Compara Wneto con Kf − Ki.',
  },
  'mechanical_energy.total': {
    idea: 'Vas a ver que Emec = K + U es la suma de las barras.',
    tryIt: 'Sin fricción la suma no cambia.',
  },
  'mechanical_energy.nonconservative': {
    idea: 'Vas a ver que la fricción reduce Emec: ΔEmec = Wnc.',
    tryIt: 'Activa μk: la barra total baja a lo largo del descenso.',
  },
  'mechanical_energy.friction_work': {
    idea: 'Vas a ver que Wf = −fk d es negativo: la distancia cuenta.',
    tryIt: 'Más camino con fricción: más pérdida de Emec.',
  },
  impulse_momentum: {
    idea: 'Vas a ver que el impulso (área de F contra t) es el cambio de momento: J = pf − pi.',
    tryIt: 'Un pulso alto y corto con la misma área que uno bajo y largo deja el mismo Δv.',
  },
  'impulse_momentum.p': {
    idea: 'Vas a ver que p = m v: a igual v, más masa, más p.',
    tryIt: 'Duplica m: p se duplica.',
  },
  'impulse_momentum.F_dpdt': {
    idea: 'Vas a ver que ΣF = dp/dt: la pendiente de p(t) es la fuerza neta.',
    tryIt: 'Durante el pulso p(t) sube; fuera, es plana.',
  },
  'impulse_momentum.J': {
    idea: 'Vas a ver que J = ∫ F dt es el área bajo F(t).',
    tryIt: 'Cambia la forma del pulso manteniendo el área: J no cambia.',
  },
  collision_1d: {
    idea: 'Vas a ver que en un choque elástico se conservan el momento y la energía cinética: los bloques rebotan con K total igual.',
    tryIt: 'Choque igual masas, uno en reposo: se intercambian las velocidades.',
  },
  'collision_1d.inelastic': {
    idea: 'Vas a ver que, si quedan unidos, hay un solo vf y K disminuye.',
    tryIt: 'Compara K antes y después: p se conserva, K no.',
  },
  'collision_1d.conservation': {
    idea: 'Vas a ver que p1i + p2i = p1f + p2f en ambos modos si no hay impulso externo.',
    tryIt: 'Lee p total antes y después: coincide.',
  },
  center_of_mass: {
    idea: 'Vas a ver que el centro de masa es el promedio de posiciones ponderado por masa: más masa «tira» del CM.',
    tryIt: 'Duplica una masa: el CM se acerca a ella.',
  },
  'center_of_mass.v_cm': {
    idea: 'Vas a ver que vCM = Ptotal / M: el CM se mueve como si toda M estuviera ahí.',
    tryIt: 'Da velocidades opuestas: el CM puede quedar casi quieto.',
  },
  beam_equilibrium: {
    idea: 'Vas a ver que en equilibrio el torque neto es cero: las fuerzas de los soportes se ajustan para cancelar los momentos de las cargas.',
    tryIt: 'Acerca una carga a un extremo: ese soporte crece. Cambia el pivote: los τ individuales cambian, la suma sigue 0.',
  },
  young_modulus: {
    idea: 'Vas a ver que Young relaciona esfuerzo F/A y deformación ΔL/L0: a igual Y, más fuerza o menos área, más alargamiento.',
    tryIt: 'Sube A: ΔL baja. El caption recuerda el régimen elástico lineal.',
  },
  'young_modulus.stress': {
    idea: 'Vas a ver que el esfuerzo es F⊥/A, no la fuerza sola.',
    tryIt: 'Misma F, doble A: σ se divide por 2.',
  },
  'young_modulus.strain': {
    idea: 'Vas a ver que la deformación ε = ΔL/L0 es adimensional.',
    tryIt: 'Barra más larga, mismo ΔL: ε es menor.',
  },
  gravitation: {
    idea: 'Vas a ver que la gravedad entre dos masas cae con r² y que las dos flechas son un par acción-reacción.',
    tryIt: 'Duplica r: F se divide por 4.',
  },
  'gravitation.field': {
    idea: 'Vas a ver que g = GM/r² es F/m sobre una masa de prueba.',
    tryIt: 'g no depende de la masa de prueba.',
  },
  orbit: {
    idea: 'Vas a ver que en órbita circular v = √(GM/r): más cerca, más rápido.',
    tryIt: 'Reduce r: vorb sube y T baja.',
  },
  'orbit.period': {
    idea: 'Vas a ver Kepler 3 para circular: T² ∝ r³.',
    tryIt: 'Duplica r: T se multiplica por 2√2.',
  },
  'orbit.escape': {
    idea: 'Vas a ver que escapar exige √2 veces la v circular a ese R (√(2GM/R)).',
    tryIt: 'Compara vesc con vorb: cociente √2.',
  },
  'orbit.U': {
    idea: 'Vas a ver que U = −GMm/r < 0 y se acerca a 0 en el infinito.',
    tryIt: 'Aleja r: U sube (es menos negativo).',
  },
  'orbit.E': {
    idea: 'Vas a ver que en circular E = K + U = −GMm/(2r).',
    tryIt: 'K = +GMm/(2r) y U = −GMm/r.',
  },
  hydrostatic: {
    idea: 'Vas a ver que la presión en un fluido en reposo sube linealmente con la profundidad: P = P0 + ρ g h.',
    tryIt: 'Baja la sonda: P crece. Cambia ρ: agua vs un fluido más ligero.',
  },
  'hydrostatic.pressure': {
    idea: 'Vas a ver que P = F⊥ / A.',
    tryIt: 'Misma fuerza, menos área: más presión.',
  },
  'hydrostatic.difference': {
    idea: 'Vas a ver que P2 − P1 = ρ g (y1 − y2).',
    tryIt: 'Dos profundidades: la diferencia solo depende de Δh.',
  },
  pascal: {
    idea: 'Vas a ver que un cambio de presión es el mismo en ambos émbolos: la fuerza grande vive en el área grande.',
    tryIt: 'A2 = 10 A1: F2 = 10 F1.',
  },
  archimedes: {
    idea: 'Vas a ver que el empuje es el peso del fluido desplazado, no del objeto.',
    tryIt: 'Objeto menos denso: flota con Vdespl/V = ρobj/ρfl. Más denso: se hunde.',
  },
  bernoulli: {
    idea: 'Vas a ver que, si el tubo se estrecha, v sube y P baja (a igual altura), de modo que P + ½ ρ v² + ρ g y se mantiene.',
    tryIt: 'Sube A2: v2 baja. Sube el tubo 2: hace falta más P1 o más v1.',
  },
  'bernoulli.Q': {
    idea: 'Vas a ver que el caudal Q = A v.',
    tryIt: 'Misma Q, menos A: más v.',
  },
  'bernoulli.continuity': {
    idea: 'Vas a ver que A v se conserva (incompresible): lo que entra sale.',
    tryIt: 'A1 v1 = A2 v2 en el caption.',
  },
  'bernoulli.torricelli': {
    idea: 'Vas a ver que la salida por un orificio a profundidad h sale a v = √(2 g h).',
    tryIt: 'Duplica h: v crece como √2, no el doble.',
  },
  'bernoulli.mass_flow': {
    idea: 'Vas a ver que ṁ = ρ A v = ρ Q.',
    tryIt: 'A igual Q, más ρ: más flujo másico.',
  },
  shm: {
    idea: 'Vas a ver que el MAS es x(t) = A cos(ω t + φ): A es el máximo alejamiento, no un extra.',
    tryIt: 'Cambia φ: el movimiento es el mismo desplazado en el tiempo.',
  },
  'shm.a': {
    idea: 'Vas a ver que a = −ω² x: máxima en los extremos, cero en el equilibrio, siempre hacia el centro.',
    tryIt: 'En x = 0, a = 0; en x = ±A, |a| es máxima.',
  },
  'shm.v': {
    idea: 'Vas a ver que v = −A ω sen(ω t + φ); v² = ω² (A² − x²). Rápido en el centro.',
    tryIt: 'En el equilibrio |v| = A ω.',
  },
  'shm.omega_spring': {
    idea: 'Vas a ver que ω = √(k/m): más masa, más lento; más k, más rápido.',
    tryIt: 'Sube m: T aumenta.',
  },
  'shm.period_spring': {
    idea: 'Vas a ver que T = 2π √(m/k).',
    tryIt: 'Cuadruplica k: T se divide por 2.',
  },
  'shm.energy': {
    idea: 'Vas a ver que K + Us es plana e igual a ½ k A².',
    tryIt: 'Las barras se intercambian; la suma no.',
  },
  'shm.vmax': {
    idea: 'Vas a ver que vmax = A ω en x = 0.',
    tryIt: 'Sube A u ω: vmax crece.',
  },
  'shm.amax': {
    idea: 'Vas a ver que amax = A ω² en x = ±A.',
    tryIt: 'En los extremos lee |a|.',
  },
  'shm.Tf': {
    idea: 'Vas a ver que f = 1/T y el punto vuelve cada T segundos.',
    tryIt: 'Cuenta un ciclo en la gráfica x(t).',
  },
  'shm.omega': {
    idea: 'Vas a ver que ω = 2π f = 2π/T.',
    tryIt: 'Compara ω con 2π/T en el caption.',
  },
  pendulum: {
    idea: 'Vas a ver que, en ángulo pequeño, el periodo solo depende de L y g: T = 2π √(L/g).',
    tryIt: 'Cambia m: T no cambia. Cambia L: T crece con √L. Abre a 40°: el caption avisa que la fórmula ya no es exacta.',
  },
  'pendulum.omega': {
    idea: 'Vas a ver que ω = √(g/L) en la aproximación de ángulo pequeño.',
    tryIt: 'Sube L: ω baja.',
  },
  traveling_wave: {
    idea: 'Vas a ver que una onda armónica no sube y baja en bloque: el patrón A sen(kx − ω t) se desplaza con v = ω/k.',
    tryIt: 'Sigue una cresta. Invierte el signo: viaja al otro lado.',
  },
  'traveling_wave.v_lambda_f': {
    idea: 'Vas a ver que v = λ f.',
    tryIt: 'Sube f a λ fija: la cresta corre más rápido.',
  },
  'traveling_wave.T': {
    idea: 'Vas a ver que T = 1/f es el tiempo de un ciclo en un x fijo.',
    tryIt: 'Un punto de la cuerda oscila con periodo T.',
  },
  'traveling_wave.k': {
    idea: 'Vas a ver que k = 2π/λ.',
    tryIt: 'λ más corta: más ondulaciones en el mismo tramo.',
  },
  'traveling_wave.omega': {
    idea: 'Vas a ver que ω = 2π f y v = ω/k.',
    tryIt: 'Compara v con λ f.',
  },
  standing_wave: {
    idea: 'Vas a ver que en una cuerda fija en los dos extremos solo caben enteros de medio λ: hay puntos que no se mueven (nodos).',
    tryIt: 'Sube n: más nodos, f proporcional a n.',
  },
  interference: {
    idea: 'Vas a ver que la interferencia la decide la diferencia de camino en unidades de λ.',
    tryIt: 'Coloca P donde Δr = λ: máxima; en λ/2: silencio.',
  },
  'interference.superposition': {
    idea: 'Vas a ver que el desplazamiento total es la suma y1 + y2.',
    tryIt: 'Dos senos en fase se refuerzan; en oposición se anulan.',
  },
  doppler: {
    idea: 'Vas a ver que si la fuente se acerca los frentes se aprietan y f′ sube; el observador que se acerca también sube f′, pero en el numerador.',
    tryIt: 'Fuente hacia el observador, observador en reposo: f′ = f v / (v − vs).',
  },
  beats: {
    idea: 'Vas a ver que dos frecuencias cercanas producen un vaivén de intensidad a |f1 − f2|.',
    tryIt: 'Acerca f2 a f1: los batidos se espacian.',
  },
  resonance_tube: {
    idea: 'Vas a ver que un tubo abierto en los dos extremos tiene frecuencias n v/(2L), con vientres en las bocas.',
    tryIt: 'Sube n: más nodos de presión (vientres de desplazamiento) en el tubo.',
  },
  'resonance_tube.closed': {
    idea: 'Vas a ver que, cerrado en un extremo, hay nodo de desplazamiento en el cerrado y solo armónicos impares n v/(4L).',
    tryIt: 'En cerrado, n = 2 está deshabilitado.',
  },
  thermal_expansion: {
    idea: 'Vas a ver que el cambio de longitud es proporcional a L0 y a ΔT.',
    tryIt: 'Doble L0 o doble ΔT: doble ΔL.',
  },
  'thermal_expansion.area': {
    idea: 'Vas a ver que el área se dilata ≈ 2α A0 ΔT.',
    tryIt: 'Compara ΔA/A0 con 2 ΔL/L0.',
  },
  'thermal_expansion.volume': {
    idea: 'Vas a ver que el volumen se dilata ≈ 3α V0 ΔT (β ≈ 3α).',
    tryIt: 'Compara ΔV/V0 con 3 ΔL/L0.',
  },
  pv_process: {
    idea: 'Vas a ver la primera ley ΔU = Q − W: el trabajo es el área en el plano P–V (positivo si el gas se expande).',
    tryIt: 'Isocoro: área 0 ⇒ W = 0, ΔU = Q. Isotermo de ideal: ΔU = 0, Q = W.',
  },
  'pv_process.ideal_gas': {
    idea: 'Vas a ver que el estado es un punto PV = n R T.',
    tryIt: 'Sube T a V fijo: P sube.',
  },
  'pv_process.combined': {
    idea: 'Vas a ver que P V / T se conserva para n fijo.',
    tryIt: 'Cambia P y V: T se ajusta.',
  },
  'pv_process.U': {
    idea: 'Vas a ver que, en un ideal monoatómico, U = (3/2) n R T solo depende de T.',
    tryIt: 'Isotermo: ΔU = 0 aunque V cambie.',
  },
  'pv_process.work': {
    idea: 'Vas a ver que W = ∫ P dV es el área bajo el camino.',
    tryIt: 'Expansión: área positiva (el gas trabaja).',
  },
  'pv_process.isothermal': {
    idea: 'Vas a ver PV = cte, ΔU = 0 y W = n R T ln(Vf/Vi).',
    tryIt: 'La hipérbola PV es más tendida que la adiabática.',
  },
  'pv_process.adiabatic': {
    idea: 'Vas a ver PV^γ = cte, más empinada que el isotermo.',
    tryIt: 'Al expandir, T baja (el gas trabaja sin entrar Q).',
  },
  heat_engine: {
    idea: 'Vas a ver que la eficiencia es el trabajo neto partido por el calor que entra del foco caliente, no W/QC.',
    tryIt: 'W = QH − QC; η = 1 − QC/QH.',
  },
  'heat_engine.carnot': {
    idea: 'Vas a ver que Carnot solo mira TC/TH (kelvin): bajar TC o subir TH mejora ηC.',
    tryIt: 'TC = 0 °C, TH = 100 °C ⇒ usa 273 y 373, no 0 y 100.',
  },
  coulomb_field: {
    idea: 'Vas a ver que la fuerza entre puntuales cae con r² y es repulsiva si las cargas se parecen.',
    tryIt: 'Cambia un signo: las flechas se invierten (atracción).',
  },
  'coulomb_field.field': {
    idea: 'Vas a ver que E = F/q de una prueba positiva.',
    tryIt: 'E apunta hacia fuera de Q > 0.',
  },
  'coulomb_field.force_on_q': {
    idea: 'Vas a ver que q < 0 siente F opuesta a E.',
    tryIt: 'Cambia el signo de la prueba: la flecha F se invierte.',
  },
  'coulomb_field.uniform': {
    idea: 'Vas a ver que entre placas |ΔV| = E d.',
    tryIt: 'Separa las placas: a E fijo, |ΔV| crece.',
  },
  resistor_network: {
    idea: 'Vas a ver que en serie la corriente es la misma y las resistencias se suman.',
    tryIt: 'Dos iguales: Req = 2R y cada una cae V/2.',
  },
  'resistor_network.parallel': {
    idea: 'Vas a ver que en paralelo la tensión es la misma y la equivalente es menor que cualquiera.',
    tryIt: 'Dos iguales R: Req = R/2 y cada rama lleva I/2.',
  },
  'resistor_network.ohm': {
    idea: 'Vas a ver que V = I R en cada elemento óhmico.',
    tryIt: 'Sube R a ε fija: I baja.',
  },
  'resistor_network.resistivity': {
    idea: 'Vas a ver que más largo o más estrecho implica más R = ρ L / A.',
    tryIt: 'Duplica L: R se duplica. Duplica A: R se divide por 2.',
  },
  kirchhoff: {
    idea: 'Vas a ver que lo que entra a un nudo sale: las corrientes se conservan como un caudal.',
    tryIt: 'I1 = I2 + I3 en el nudo.',
  },
  'kirchhoff.loop': {
    idea: 'Vas a ver que al cerrar una malla las subidas y bajadas de potencial suman cero.',
    tryIt: 'Recorre la malla: +ε − I R1 − I R2 = 0.',
  },
  parallel_plate: {
    idea: 'Vas a ver que acercar las placas o agrandar el área sube C = ε0 A / d.',
    tryIt: 'Reduce d: C crece; a Q fija, V baja.',
  },
  'parallel_plate.C_QV': {
    idea: 'Vas a ver que C = Q / V. A igual Q, más C implica menos V.',
    tryIt: 'Sube C: V = Q/C cae.',
  },
  'parallel_plate.energy': {
    idea: 'Vas a ver que U = ½ C V².',
    tryIt: 'A V fija, más C: más energía almacenada.',
  },
  approach_guide: {
    idea: 'Vas a ver que el enunciado ya dice el bloque: la señal (choque, órbita, DCL, …) apunta a una sección, no a memorizar 195 IDs.',
    tryIt: 'Elige «proyectil, alcance»: el árbol termina en Movimiento 2D y 3D.',
  },
};

export function physCopy(type: string, mode?: string): PhysCopy {
  if (mode) {
    const keyed = COPY[`${type}.${mode}`];
    if (keyed) return keyed;
  }
  return COPY[type] ?? FALLBACK;
}
