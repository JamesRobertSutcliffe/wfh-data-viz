async function fetchDataAndCreateCharts() {
    try {
        const response = await fetch('./data.json');
        const data = await response.json();

        const formattedData = Object.entries(data).map(([key, value]) => ({
            category: key.replace(/_/g, ' '),
            value
        }));

        createBubbleChart(formattedData);
        createBarChart(formattedData);
        createTreemapCharts();

    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
}

function createBubbleChart(data) {
    const svg = d3.select("#bubble-chart"),
        margin = { top: 100, right: 20, bottom: 30, left: 20 },
        width = 1200 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const bubble = d3.pack()
        .size([width, height])
        .padding(25);

    const root = d3.hierarchy({ children: data })
        .sum(d => d.value);

    const nodes = bubble(root).leaves();

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x + margin.left},${d.y + margin.top})`)
        .on("mouseover", (event, d) => {
            d3.select("#tooltip")
                .style("opacity", 1)
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY - 28}px`)
                .html(`${d.data.category}<br>Percentage: ${d.data.value}%`);
        })
        .on("mouseout", () => {
            d3.select("#tooltip").style("opacity", 0);
        });

    node.append("circle")
        .attr("r", d => d.r * 1.15)
        .style("fill", (d, i) => color(i))
        .style("stroke", "black")
        .style("stroke-width", "1px");

    node.append("title")
        .text(d => `${d.data.category}: ${d.data.value}%`);

    node.append("text")
        .attr("dy", "-0.5em")
        .style("text-anchor", "middle")
        .style("font-size", "0.9rem")
        .style("font-weight", "bold")
        .each(function(d) {
            const fullText = d.data.category;
            const truncatedText = fullText.length > 15 ? fullText.slice(0, 20) + '...' : fullText;
            const lines = truncatedText.split(' ').reduce((acc, word) => {
                const lastLine = acc[acc.length - 1];
                if (lastLine && (lastLine + ' ' + word).length <= 15) {
                    acc[acc.length - 1] += ' ' + word;
                } else {
                    acc.push(word);
                }
                return acc;
            }, []);
            lines.forEach((line, i) => {
                d3.select(this).append("tspan")
                    .attr("x", 0)
                    .attr("dy", i === 0 ? 0 : "1.2em")
                    .text(line);
            });
        });

    node.append("text")
        .attr("dy", "2.5em")
        .style("text-anchor", "middle")
        .style("font-size", "0.9rem")
        .style("font-weight", "bold")
        .text(d => `${d.data.value}%`);
}

function createBarChart(data) {
    const svg = d3.select("#bar-chart"),
        margin = { top: 30, right: 20, bottom: 150, left: 80 },
        width = 1200 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom);

    const x = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, 50])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.selectAll("*").remove();

    svg.append("g")
        .selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("x", d => x(d.category))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.value))
        .attr("fill", (d, i) => d3.schemeCategory10[i]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks())
        .selectAll("text")
        .style("font-size", "0.8rem");

    svg.append("g")
        .selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("x", d => x(d.category) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "0.8rem")
        .style("font-weight", "bold")
        .text(d => `${d.value}%`);

    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.bottom - 20})`)
        .style("text-anchor", "middle")
        .style("font-size", "1rem")
        .style("font-weight", "bold")
        .text("Categories");

    svg.append("text")
        .attr("transform", `translate(${margin.left / 2},${height / 2}) rotate(-90)`)
        .style("text-anchor", "middle")
        .style("font-size", "1rem")
        .style("font-weight", "bold")
        .text("Percentage of Responses");
}

function createTreemapCharts() {
    const data = {
        "name": "Working From Home",
        "children": [
            {
                "name": "Advantages",
                "children": [
                    { "name": "Improved work life balance", "value": 78 },
                    { "name": "Fewer distractions", "value": 53 },
                    { "name": "Quicker to complete work", "value": 52 },
                    { "name": "Improved wellbeing", "value": 47 },
                    { "name": "Easier to think of new ideas", "value": 16 },
                    { "name": "Easier to work with others", "value": 12 },
                    { "name": "Other, please specify", "value": 11 },
                    { "name": "No benefit", "value": 8 },
                    { "name": "More jobs", "value": 7 }
                ]
            },
            {
                "name": "Disadvantages",
                "children": [
                    { "name": "Harder to work with others", "value": 48 },
                    { "name": "No disadvantages", "value": 31 },
                    { "name": "More distractions", "value": 26 },
                    { "name": "Reduced wellbeing", "value": 19 },
                    { "name": "Fewer new ideas", "value": 15 },
                    { "name": "Other, please specify", "value": 10 },
                    { "name": "Reduced work life balance", "value": 9 },
                    { "name": "Slower to complete work", "value": 9 },
                    { "name": "Fewer jobs", "value": 5 }
                ]
            }
        ]
    };

    const svgAdvantages = d3.select("#treemap-advantages"),
        svgDisadvantages = d3.select("#treemap-disadvantages"),
        margin = { top: 30, right: 20, bottom: 30, left: 60 },
        width = (2400 - margin.left - margin.right) / 2,
        height = 700 - margin.top - margin.bottom;

    function createTreemap(svg, data, colorScheme) {
        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

        const color = d3.scaleOrdinal(colorScheme);

        const treemap = d3.treemap()
            .size([width, height])
            .padding(4);

        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        treemap(root);

        svg.selectAll("*").remove();

        const nodes = svg.selectAll(".node")
            .data(root.leaves())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x0 + margin.left},${d.y0 + margin.top})`);

        nodes.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .style("fill", d => color(d.parent.data.name))
            .style("stroke", "black")
            .style("stroke-width", "1px");

        nodes.append("text")
            .attr("x", d => (d.x1 - d.x0) / 2)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .style("text-anchor", "middle")
            .style("font-size", "0.65rem")
            .style("font-weight", "bold")
            .text(d => `${d.data.name} (${d.data.value}%)`);
    }

    createTreemap(svgAdvantages, data.children[0], d3.schemeCategory10);
    createTreemap(svgDisadvantages, data.children[1], d3.schemeAccent);
}



fetchDataAndCreateCharts();
