import { decryptIfExists } from './encryption'

export interface EmpleadoDataSensible {
  dni: string | null
  naf: string | null
  iban: string | null
  telefono: string | null
  salario: string | null
}

interface EmpleadoConCifrado {
  esDemostracion: boolean
  dni?: string | null
  naf?: string | null
  iban?: string | null
  telefono?: string | null
  salario?: any | null
  dniEnc?: string | null
  nafEnc?: string | null
  ibanEnc?: string | null
  telefonoEnc?: string | null
  salarioEnc?: string | null
}

export function getEmpleadoData(empleado: EmpleadoConCifrado): EmpleadoDataSensible {
  if (empleado.esDemostracion) {
    return {
      dni:      empleado.dni      ?? null,
      naf:      empleado.naf      ?? null,
      iban:     empleado.iban     ?? null,
      telefono: empleado.telefono ?? null,
      salario:  empleado.salario  ? String(empleado.salario) : null,
    }
  }
  return {
    dni:      decryptIfExists(empleado.dniEnc),
    naf:      decryptIfExists(empleado.nafEnc),
    iban:     decryptIfExists(empleado.ibanEnc),
    telefono: decryptIfExists(empleado.telefonoEnc),
    salario:  decryptIfExists(empleado.salarioEnc),
  }
}

export function prepararCamposCifrados(datos: {
  dni?: string
  naf?: string
  iban?: string
  telefono?: string
  salario?: string
}, esDemostracion: boolean) {
  const { encrypt } = require('./encryption')

  if (esDemostracion) {
    return {
      dni:         datos.dni      ?? null,
      naf:         datos.naf      ?? null,
      iban:        datos.iban     ?? null,
      telefono:    datos.telefono ?? null,
      salario:     datos.salario  ? parseFloat(datos.salario) : null,
      dniEnc:      '',
      nafEnc:      '',
      ibanEnc:     '',
      telefonoEnc: '',
      salarioEnc:  '',
    }
  }

  return {
    dni:         null,
    naf:         null,
    iban:        null,
    telefono:    null,
    salario:     null,
    dniEnc:      datos.dni      ? encrypt(datos.dni)      : '',
    nafEnc:      datos.naf      ? encrypt(datos.naf)      : '',
    ibanEnc:     datos.iban     ? encrypt(datos.iban)     : '',
    telefonoEnc: datos.telefono ? encrypt(datos.telefono) : '',
    salarioEnc:  datos.salario  ? encrypt(datos.salario)  : '',
  }
}