/**
 * 计算房贷还款信息
 * @param {string} repaymentMethod - 还款方式，'equal-principal-interest' 表示等额本息，'equal-principal' 表示等额本金
 * @param {number} loanAmount - 贷款金额（元）
 * @param {number} annualInterestRate - 年利率（百分比，如4.5表示4.5%）
 * @param {number} loanYears - 还款年数（10、20或30）
 * @returns {object} 包含月供、总利息和总还款金额的对象
 */
function calculateMortgage(
  repaymentMethod,
  loanAmount,
  annualInterestRate,
  loanYears
) {
  // 验证输入参数
  if (
    !["equal-principal-interest", "equal-principal"].includes(repaymentMethod)
  ) {
    throw new Error(
      '还款方式必须是 "equal-principal-interest" 或 "equal-principal"'
    );
  }

  if (typeof loanAmount !== "number" || loanAmount <= 0) {
    throw new Error("贷款金额必须是正数");
  }

  if (typeof annualInterestRate !== "number" || annualInterestRate <= 0) {
    throw new Error("年利率必须是正数");
  }

  if (![10, 20, 30].includes(loanYears)) {
    throw new Error("还款年数必须是10、20或30");
  }

  // 计算基础参数
  const monthlyRate = annualInterestRate / 100 / 12; // 月利率
  const totalMonths = loanYears * 12; // 总还款月数

  let monthlyPayment, totalInterest, totalPayment;

  if (repaymentMethod === "equal-principal-interest") {
    // 等额本息计算
    // 月供 = 贷款本金 × 月利率 × (1+月利率)^还款月数 ÷ [(1+月利率)^还款月数 - 1]
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
    totalPayment = monthlyPayment * totalMonths;
    totalInterest = totalPayment - loanAmount;

    return {
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
    };
  } else {
    // 等额本金计算
    const monthlyPrincipal = loanAmount / totalMonths; // 每月固定本金
    const firstMonthInterest = loanAmount * monthlyRate; // 首月利息
    const firstMonthPayment = monthlyPrincipal + firstMonthInterest; // 首月月供
    const monthlyDecrease = monthlyPrincipal * monthlyRate; // 每月递减金额

    // 总利息 = (首月利息 + 末月利息) × 还款月数 ÷ 2
    const lastMonthInterest = monthlyPrincipal * monthlyRate;
    totalInterest =
      ((firstMonthInterest + lastMonthInterest) * totalMonths) / 2;
    totalPayment = loanAmount + totalInterest;

    return {
      monthlyPayment: {
        firstMonth: parseFloat(firstMonthPayment.toFixed(2)),
        monthlyDecrease: parseFloat(monthlyDecrease.toFixed(2)),
        description: "月供逐月递减，以上为首月月供和每月递减金额",
      },
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalPayment: parseFloat(totalPayment.toFixed(2)),
    };
  }
}

// 格式化金额显示
function formatCurrency(amount) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// 显示Loading状态
function showLoading() {
  const btn = document.getElementById("calculateBtn");
  const spinner = document.getElementById("loadingSpinner");
  const btnText = document.getElementById("btnText");

  btn.disabled = true;
  spinner.classList.add("show");
  btnText.classList.add("loading");
  btnText.textContent = "计算中...";
}

// 隐藏Loading状态
function hideLoading() {
  const btn = document.getElementById("calculateBtn");
  const spinner = document.getElementById("loadingSpinner");
  const btnText = document.getElementById("btnText");

  btn.disabled = false;
  spinner.classList.remove("show");
  btnText.classList.remove("loading");
  btnText.textContent = "计算房贷";
}

// 模拟异步计算过程
function calculateAsync(inputData) {
  return new Promise((resolve, reject) => {
    // 模拟计算耗时
    setTimeout(() => {
      try {
        const result = calculateMortgage(
          inputData.repaymentMethod,
          inputData.loanAmount * 10000, // 万元转换为元
          inputData.annualInterestRate,
          inputData.loanYears
        );
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, 800); // 模拟800ms的计算时间
  });
}

// 显示计算结果
function showResults(result, inputData) {
  const resultContent = document.getElementById("resultContent");

  let html = `
    <div class="result-item">
      <div class="result-label">贷款信息</div>
      <div class="result-description">
        贷款金额：${inputData.loanAmount}万元（${formatCurrency(
    inputData.loanAmount * 10000
  )}）<br>
        还款方式：${
          inputData.repaymentMethod === "equal-principal-interest"
            ? "等额本息"
            : "等额本金"
        }<br>
        年利率：${inputData.annualInterestRate}%<br>
        还款年数：${inputData.loanYears}年
      </div>
    </div>
  `;

  if (inputData.repaymentMethod === "equal-principal-interest") {
    html += `
      <div class="result-item">
        <div class="result-label">月供金额</div>
        <div class="result-value">${formatCurrency(result.monthlyPayment)}</div>
        <div class="result-description">每月固定还款金额</div>
      </div>
    `;
  } else {
    html += `
      <div class="result-item">
        <div class="result-label">首月月供</div>
        <div class="result-value">${formatCurrency(
          result.monthlyPayment.firstMonth
        )}</div>
        <div class="result-description">
          每月递减：${formatCurrency(result.monthlyPayment.monthlyDecrease)}<br>
          ${result.monthlyPayment.description}
        </div>
      </div>
    `;
  }

  html += `
    <div class="result-item">
      <div class="result-label">总利息</div>
      <div class="result-value">${formatCurrency(result.totalInterest)}</div>
      <div class="result-description">整个还款期间支付的利息总额</div>
    </div>

    <div class="result-item">
      <div class="result-label">总还款金额</div>
      <div class="result-value">${formatCurrency(result.totalPayment)}</div>
      <div class="result-description">本金 + 利息的总金额</div>
    </div>
  `;

  resultContent.innerHTML = html;
  document.getElementById("resultModal").style.display = "block";
}

// 显示错误信息
function showError(message) {
  document.getElementById("errorContent").textContent = message;
  document.getElementById("errorModal").style.display = "block";
}

// 关闭弹窗
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// 处理表单提交
document
  .getElementById("mortgageForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // 显示Loading
    showLoading();

    try {
      // 获取表单数据
      const formData = new FormData(this);
      const inputData = {
        repaymentMethod: formData.get("repaymentMethod"),
        loanAmount: parseFloat(formData.get("loanAmount")),
        annualInterestRate: parseFloat(formData.get("annualInterestRate")),
        loanYears: parseInt(formData.get("loanYears")),
      };

      // 验证输入
      if (!inputData.repaymentMethod) {
        throw new Error("请选择还款方式");
      }

      if (!inputData.loanAmount || inputData.loanAmount <= 0) {
        throw new Error("请输入有效的贷款金额");
      }

      if (!inputData.annualInterestRate || inputData.annualInterestRate <= 0) {
        throw new Error("请输入有效的年利率");
      }

      if (!inputData.loanYears) {
        throw new Error("请选择还款年数");
      }

      // 异步计算结果
      const result = await calculateAsync(inputData);

      // 显示结果
      showResults(result, inputData);
    } catch (error) {
      showError(error.message);
    } finally {
      // 隐藏Loading
      hideLoading();
    }
  });

// 点击弹窗外部关闭弹窗
window.addEventListener("click", function (event) {
  const resultModal = document.getElementById("resultModal");
  const errorModal = document.getElementById("errorModal");

  if (event.target === resultModal) {
    resultModal.style.display = "none";
  }

  if (event.target === errorModal) {
    errorModal.style.display = "none";
  }
});

// ESC键关闭弹窗
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal("resultModal");
    closeModal("errorModal");
  }
});
