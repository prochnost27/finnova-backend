const express = require("express")

const cors = require("cors")

const bcrypt = require("bcrypt")

const { Pool } = require("pg")

const app = express()

app.use(cors())

app.use(express.json())

const pool = new Pool({

  connectionString:
    process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false
  }

})









function generarPerfil(score) {

  if (score >= 850) return "AAA"

  if (score >= 750) return "AA"

  if (score >= 650) return "A"

  if (score >= 550) return "B"

  return "C"

}









function generarTasas(score) {

  const base =

    score >= 850 ? 3 :

    score >= 750 ? 5 :

    score >= 650 ? 7 :

    score >= 550 ? 9 :

    12

  return {

    bac: (base + Math.random() * 1.5).toFixed(2),

    bi: (base + Math.random() * 2).toFixed(2),

    banrural: (base + Math.random() * 2.5).toFixed(2),

    promerica: (base + Math.random() * 1.8).toFixed(2),

    bam: (base + Math.random() * 2).toFixed(2),

    bantrab: (base + Math.random() * 2.3).toFixed(2),

    micoope: (base + Math.random() * 3).toFixed(2),

    antigua: (base + Math.random() * 2.7).toFixed(2),

    interbanco: (base + Math.random() * 2.4).toFixed(2),

    gyt: (base + Math.random() * 1.9).toFixed(2),

    chn: (base + Math.random() * 2.1).toFixed(2)

  }

}









app.post("/registro", async (req, res) => {

  try {

    const {

      nombre,
      correo,
      password

    } = req.body







    const existe =
      await pool.query(

        `
        SELECT * FROM usuarios
        WHERE correo = $1
        `,

        [correo]

      )







    if (existe.rows.length > 0) {

      return res.status(400).json({

        mensaje:
          "Correo ya registrado"

      })

    }







    const hash =
      await bcrypt.hash(password, 10)







    await pool.query(

      `
      INSERT INTO usuarios

      (

        nombre,
        correo,
        password

      )

      VALUES ($1,$2,$3)
      `,

      [

        nombre,
        correo,
        hash

      ]

    )







    res.json({

      mensaje:
        "Usuario registrado"

    })

  }

  catch (error) {

    console.log(error)







    res.status(500).json({

      mensaje:
        "Error servidor"

    })

  }

})









app.post("/login", async (req, res) => {

  try {

    const {

      correo,
      password

    } = req.body







    const usuario =
      await pool.query(

        `
        SELECT * FROM usuarios
        WHERE correo = $1
        `,

        [correo]

      )







    if (usuario.rows.length === 0) {

      return res.status(400).json({

        mensaje:
          "Usuario no encontrado"

      })

    }







    const valido =
      await bcrypt.compare(

        password,

        usuario.rows[0].password

      )







    if (!valido) {

      return res.status(400).json({

        mensaje:
          "Credenciales incorrectas"

      })

    }







    res.json(usuario.rows[0])

  }

  catch (error) {

    console.log(error)







    res.status(500).json({

      mensaje:
        "Error servidor"

    })

  }

})









app.post("/onboarding", async (req, res) => {

  try {

    const {

      id,
      dpi,
      nacimiento,
      ingresos,
      trabajo,
      tipo_ingreso,
      antiguedad

    } = req.body







    let score = 500







    if (ingresos >= 15000) score += 200

    if (ingresos >= 30000) score += 150

    if (tipo_ingreso === "Asalariado") score += 100

    if (tipo_ingreso === "Comerciante") score += 80

    if (antiguedad >= 2) score += 100

    if (antiguedad >= 5) score += 120







    if (score > 999) {

      score = 999

    }







    const perfil =
      generarPerfil(score)







    const tasas =
      generarTasas(score)







    await pool.query(

      `
      UPDATE usuarios

      SET

      dpi = $1,
      nacimiento = $2,
      ingresos = $3,
      trabajo = $4,
      tipo_ingreso = $5,
      antiguedad = $6,
      score = $7,
      perfil = $8,

      bac = $9,
      bi = $10,
      banrural = $11,
      promerica = $12,
      bam = $13,
      bantrab = $14,
      micoope = $15,
      antigua = $16,
      interbanco = $17,
      gyt = $18,
      chn = $19

      WHERE id = $20
      `,

      [

        dpi,
        nacimiento,
        ingresos,
        trabajo,
        tipo_ingreso,
        antiguedad,
        score,
        perfil,

        tasas.bac,
        tasas.bi,
        tasas.banrural,
        tasas.promerica,
        tasas.bam,
        tasas.bantrab,
        tasas.micoope,
        tasas.antigua,
        tasas.interbanco,
        tasas.gyt,
        tasas.chn,

        id

      ]

    )







    const usuarioActualizado =
      await pool.query(

        `
        SELECT * FROM usuarios
        WHERE id = $1
        `,

        [id]

      )







    res.json(usuarioActualizado.rows[0])

  }

  catch (error) {

    console.log(error)







    res.status(500).json({

      mensaje:
        "Error servidor"

    })

  }

})









app.post("/guardar-simulacion", async (req, res) => {

  try {

    const {

      usuario_id,
      banco,
      monto,
      plazo,
      cuota,
      total

    } = req.body







    await pool.query(

      `
      INSERT INTO simulaciones

      (

        usuario_id,
        banco,
        monto,
        plazo,
        cuota,
        total

      )

      VALUES ($1,$2,$3,$4,$5,$6)
      `,

      [

        usuario_id,
        banco,
        monto,
        plazo,
        cuota,
        total

      ]

    )







    res.json({

      mensaje:
        "Simulación guardada"

    })

  }

  catch (error) {

    console.log(error)







    res.status(500).json({

      mensaje:
        "Error servidor"

    })

  }

})









app.get("/historial/:id", async (req, res) => {

  try {

    const { id } = req.params







    const historial =
      await pool.query(

        `
        SELECT * FROM simulaciones

        WHERE usuario_id = $1

        ORDER BY id DESC
        `,

        [id]

      )







    res.json(historial.rows)

  }

  catch (error) {

    console.log(error)







    res.status(500).json({

      mensaje:
        "Error servidor"

    })

  }

})









app.listen(3000, () => {

  console.log(

    "Servidor activo puerto 3000"

  )

})