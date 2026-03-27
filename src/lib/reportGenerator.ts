import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FinancialData } from "../types";
import { formatCurrency } from "./utils";

export function generateAnnualReport(data: FinancialData, year: number) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Helper to filter by year
  const isCurrentYear = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getFullYear() === year;
  };

  const yearTransactions = data.transactions.filter(t => isCurrentYear(t.date));
  const yearInvestments = data.investments.filter(i => isCurrentYear(i.date));

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Relatório Financeiro Anual", 14, 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text(`Ano de Referência: ${year}`, 14, 32);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, pageWidth - 14, 32, { align: "right" });

  // Summary Section
  const totalIncome = yearTransactions
    .filter(t => t.type === "Receita")
    .reduce((acc, t) => acc + t.value, 0);
  const totalExpenses = yearTransactions
    .filter(t => t.type === "Despesa")
    .reduce((acc, t) => acc + t.value, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("1. Resumo Executivo", 14, 60);
  
  autoTable(doc, {
    startY: 65,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de Receitas", formatCurrency(totalIncome)],
      ["Total de Despesas", formatCurrency(totalExpenses)],
      ["Saldo Acumulado (Economia)", formatCurrency(balance)],
      ["Taxa de Poupança", `${savingsRate.toFixed(1)}%`],
    ],
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], fontStyle: "bold" }, // emerald-500
    styles: { fontSize: 11 },
  });

  // Monthly Breakdown
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthlyData = months.map((month, idx) => {
    const monthTransactions = yearTransactions.filter(t => new Date(t.date).getMonth() === idx);
    const income = monthTransactions.filter(t => t.type === "Receita").reduce((acc, t) => acc + t.value, 0);
    const expenses = monthTransactions.filter(t => t.type === "Despesa").reduce((acc, t) => acc + t.value, 0);
    return [month, formatCurrency(income), formatCurrency(expenses), formatCurrency(income - expenses)];
  });

  doc.setFontSize(18);
  doc.text("2. Evolução Mensal", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Mês", "Receitas", "Despesas", "Saldo"]],
    body: monthlyData,
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105], fontStyle: "bold" }, // slate-600
    styles: { fontSize: 10 },
  });

  // Expenses by Category
  const categoryData = Object.entries(
    yearTransactions
      .filter(t => t.type === "Despesa")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.value;
        return acc;
      }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  // Check if we need a new page
  if ((doc as any).lastAutoTable.finalY > 200) doc.addPage();

  doc.setFontSize(18);
  doc.text("3. Distribuição de Gastos por Categoria", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Categoria", "Valor Total", "% do Gasto Total"]],
    body: categoryData.map(([cat, val]) => [
      cat,
      formatCurrency(val),
      `${((val / totalExpenses) * 100).toFixed(1)}%`
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" }, // blue-500
    styles: { fontSize: 10 },
  });

  // Investments
  const totalInvested = yearInvestments.reduce((acc, i) => acc + i.value, 0);
  
  if ((doc as any).lastAutoTable.finalY > 220) doc.addPage();

  doc.setFontSize(18);
  doc.text("4. Aportes em Investimentos", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Ativo", "Categoria", "Data", "Valor"]],
    body: [
      ...yearInvestments.map(i => [i.name, i.category, new Date(i.date).toLocaleDateString(), formatCurrency(i.value)]),
      [{ content: "Total Investido no Ano", colSpan: 3, styles: { fontStyle: "bold", halign: "right" } }, { content: formatCurrency(totalInvested), styles: { fontStyle: "bold" } }]
    ],
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246], fontStyle: "bold" }, // violet-500
    styles: { fontSize: 10 },
  });

  // Fixed Bills Summary
  const fixedBillsTotal = data.fixedBills.reduce((acc, b) => acc + b.value, 0);
  doc.setFontSize(18);
  doc.text("5. Compromissos Fixos Mensais", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Conta", "Vencimento", "Valor"]],
    body: [
      ...data.fixedBills.map(b => [b.name, `Dia ${b.dueDate}`, formatCurrency(b.value)]),
      [{ content: "Total Fixo Mensal Estimado", colSpan: 2, styles: { fontStyle: "bold", halign: "right" } }, { content: formatCurrency(fixedBillsTotal), styles: { fontStyle: "bold" } }]
    ],
    theme: "striped",
    headStyles: { fillColor: [245, 158, 11], fontStyle: "bold" }, // amber-500
    styles: { fontSize: 10 },
  });

  // Insights
  if ((doc as any).lastAutoTable.finalY > 230) doc.addPage();
  
  doc.setFontSize(18);
  doc.text("6. Insights e Conclusões", 14, (doc as any).lastAutoTable.finalY + 20);
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  
  const insights = [
    `• Performance de Poupança: Você economizou ${formatCurrency(balance)} este ano, uma taxa de ${savingsRate.toFixed(1)}%.`,
    `• Meta de Poupança: Sua meta era de ${data.savingsGoalPercent}%. Você está ${savingsRate >= data.savingsGoalPercent ? 'acima' : 'abaixo'} do planejado.`,
    `• Concentração de Gastos: A categoria "${categoryData[0]?.[0] || 'N/A'}" consumiu ${((categoryData[0]?.[1] || 0) / totalExpenses * 100).toFixed(1)}% do seu orçamento.`,
    `• Investimentos: Foram realizados ${yearInvestments.length} aportes estratégicos, totalizando ${formatCurrency(totalInvested)}.`,
    `• Contas Fixas: Seus custos fixos mensais representam aproximadamente ${((fixedBillsTotal * 12 / totalIncome) * 100).toFixed(1)}% da sua receita anual.`
  ];

  let yPos = (doc as any).lastAutoTable.finalY + 30;
  insights.forEach(insight => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(insight, 14, yPos);
    yPos += 8;
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Relatório Gerado Localmente • Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  }

  doc.save(`Relatorio_Financeiro_Anual_${year}.pdf`);
}

export function generateMonthlyReport(data: FinancialData, month: number, year: number) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const monthName = months[month];

  // Helper to filter by month and year
  const isTargetMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const monthTransactions = data.transactions.filter(t => isTargetMonth(t.date));
  const monthInvestments = data.investments.filter(i => isTargetMonth(i.date));

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Relatório Financeiro Mensal", 14, 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text(`Período: ${monthName} de ${year}`, 14, 32);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, pageWidth - 14, 32, { align: "right" });

  // Summary Section
  const totalIncome = monthTransactions
    .filter(t => t.type === "Receita")
    .reduce((acc, t) => acc + t.value, 0);
  const totalExpenses = monthTransactions
    .filter(t => t.type === "Despesa")
    .reduce((acc, t) => acc + t.value, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("1. Resumo do Mês", 14, 60);
  
  autoTable(doc, {
    startY: 65,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de Receitas", formatCurrency(totalIncome)],
      ["Total de Despesas", formatCurrency(totalExpenses)],
      ["Saldo do Mês", formatCurrency(balance)],
      ["Taxa de Poupança", `${savingsRate.toFixed(1)}%`],
    ],
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129], fontStyle: "bold" }, // emerald-500
    styles: { fontSize: 11 },
  });

  // Expenses by Category
  const categoryData = Object.entries(
    monthTransactions
      .filter(t => t.type === "Despesa")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.value;
        return acc;
      }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  doc.setFontSize(18);
  doc.text("2. Gastos por Categoria", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Categoria", "Valor Total", "% do Gasto"]],
    body: categoryData.map(([cat, val]) => [
      cat,
      formatCurrency(val),
      `${((val / totalExpenses) * 100).toFixed(1)}%`
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" }, // blue-500
    styles: { fontSize: 10 },
  });

  // Budget Performance
  const budgetPerformance = data.budgets.map(budget => {
    const spent = categoryData.find(([cat]) => cat === budget.category)?.[1] || 0;
    const diff = budget.planned - spent;
    const status = diff >= 0 ? "Dentro" : "Excedido";
    return [budget.category, formatCurrency(budget.planned), formatCurrency(spent), formatCurrency(diff), status];
  });

  if ((doc as any).lastAutoTable.finalY > 200) doc.addPage();

  doc.setFontSize(18);
  doc.text("3. Desempenho do Orçamento", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Categoria", "Planejado", "Realizado", "Diferença", "Status"]],
    body: budgetPerformance,
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105], fontStyle: "bold" }, // slate-600
    styles: { fontSize: 9 },
    columnStyles: {
      4: { fontStyle: "bold" }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'Excedido') {
          data.cell.styles.textColor = [225, 29, 72]; // rose-600
        } else {
          data.cell.styles.textColor = [5, 150, 105]; // emerald-600
        }
      }
    }
  });

  // Detailed Transactions
  doc.addPage();
  doc.setFontSize(18);
  doc.text("4. Detalhamento de Transações", 14, 20);

  autoTable(doc, {
    startY: 25,
    head: [["Data", "Descrição", "Categoria", "Tipo", "Valor"]],
    body: monthTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.category,
        t.type,
        formatCurrency(t.value)
      ]),
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], fontStyle: "bold" },
    styles: { fontSize: 8 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw === 'Despesa') {
          data.cell.styles.textColor = [225, 29, 72];
        } else {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Relatório Mensal • ${monthName}/${year} • Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  }

  doc.save(`Relatorio_Financeiro_${monthName}_${year}.pdf`);
}

export function generateExpenseReport(data: FinancialData, month: number, year: number) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const monthName = months[month];

  const isTargetMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getMonth() === month && date.getFullYear() === year;
  };

  const expenses = data.transactions.filter(t => t.type === "Despesa" && isTargetMonth(t.date));

  // Header
  doc.setFillColor(225, 29, 72); // rose-600
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Relatório de Gastos Detalhado", 14, 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(255, 200, 200);
  doc.text(`Período: ${monthName} de ${year}`, 14, 32);
  doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, pageWidth - 14, 32, { align: "right" });

  // Summary
  const totalExpenses = expenses.reduce((acc, t) => acc + t.value, 0);
  const paidExpenses = expenses.filter(t => t.status === "Pago").reduce((acc, t) => acc + t.value, 0);
  const pendingExpenses = expenses.filter(t => t.status === "Pendente").reduce((acc, t) => acc + t.value, 0);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("1. Resumo de Despesas", 14, 60);

  autoTable(doc, {
    startY: 65,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total de Despesas", formatCurrency(totalExpenses)],
      ["Despesas Pagas", formatCurrency(paidExpenses)],
      ["Despesas Pendentes", formatCurrency(pendingExpenses)],
      ["Quantidade de Itens", expenses.length.toString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [225, 29, 72], fontStyle: "bold" },
    styles: { fontSize: 11 },
  });

  // By Category
  const categoryData = Object.entries(
    expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  doc.setFontSize(18);
  doc.text("2. Gastos por Categoria", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Categoria", "Valor Total", "% do Total"]],
    body: categoryData.map(([cat, val]) => [
      cat,
      formatCurrency(val),
      `${((val / totalExpenses) * 100).toFixed(1)}%`
    ]),
    theme: "striped",
    headStyles: { fillColor: [71, 85, 105], fontStyle: "bold" },
    styles: { fontSize: 10 },
  });

  // By Payment Method
  const methodData = Object.entries(
    expenses.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);

  doc.setFontSize(18);
  doc.text("3. Gastos por Meio de Pagamento", 14, (doc as any).lastAutoTable.finalY + 20);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [["Meio de Pagamento", "Valor Total", "% do Total"]],
    body: methodData.map(([method, val]) => [
      method,
      formatCurrency(val),
      `${((val / totalExpenses) * 100).toFixed(1)}%`
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], fontStyle: "bold" },
    styles: { fontSize: 10 },
  });

  // Detailed List
  doc.addPage();
  doc.setFontSize(18);
  doc.text("4. Lista Detalhada de Despesas", 14, 20);

  autoTable(doc, {
    startY: 25,
    head: [["Data", "Descrição", "Categoria", "Meio", "Status", "Valor"]],
    body: expenses
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.category,
        t.paymentMethod,
        t.status,
        formatCurrency(t.value)
      ]),
    theme: "grid",
    headStyles: { fillColor: [15, 23, 42], fontStyle: "bold" },
    styles: { fontSize: 8 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'Pendente') {
          data.cell.styles.textColor = [225, 29, 72];
        } else {
          data.cell.styles.textColor = [5, 150, 105];
        }
      }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Relatório de Gastos • ${monthName}/${year} • Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  }

  doc.save(`Relatorio_Gastos_${monthName}_${year}.pdf`);
}
