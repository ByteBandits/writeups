#include "pin.H"
#include <stdio.h>
#include <fstream>
#include <iostream>

using namespace std;
PIN_LOCK globalLock;
KNOB<string> KnobOutputFile(KNOB_MODE_WRITEONCE, "pintool", "o", "pin.out", "specify output file name");
ofstream outFile;
ADDRINT l, h;

VOID callback_image(IMG img, VOID *v)
{
  if (IMG_IsMainExecutable(img))
  {
    l = IMG_LowAddress(img);
    h = IMG_HighAddress(img);
  }
}

VOID logme(ADDRINT ip, CONTEXT *ctx)
{
  if ((ip & 0xff) != 0x6a)
  {
    return;
  }
  PIN_REGISTER regval;
  PIN_GetContextRegval(ctx, REG_EDX, reinterpret_cast<UINT8 *>(&regval));
  // if(regval.dword[0] != 0x87) {
  //   return;
  // }
  outFile << std::hex << regval.dword[0] << "::::";
  ADDRINT value;
  for(int i = 0; i <= 10; i++) {
    ADDRINT *op2 = (ADDRINT *)(ip + 11474 + i*4);
    PIN_SafeCopy(&value, op2, sizeof(ADDRINT));
    outFile << (value & 0xffffffff) << " ";
  }
  outFile << endl;
}

VOID callback_instruction(INS ins, VOID *v)
{
  if (INS_Opcode(ins) == XED_ICLASS_MOV && INS_OperandReg(ins, 0) == REG_EDX && INS_OperandReg(ins, 1) == REG_EDX)
  {
    INS_InsertCall(ins, IPOINT_AFTER, (AFUNPTR)logme, IARG_INST_PTR, IARG_CONTEXT,
                   IARG_END);
  }
}

VOID fini(INT32 code, VOID *v)
{
  outFile.close();
}

int main(int argc, char *argv[])
{
  if (PIN_Init(argc, argv))
  {
    perror("init");
    return 0;
  }
  outFile.open(KnobOutputFile.Value().c_str());
  IMG_AddInstrumentFunction(callback_image, 0);
  INS_AddInstrumentFunction(callback_instruction, 0);
  PIN_AddFiniFunction(fini, 0);
  PIN_StartProgram();
  return 0;
}
